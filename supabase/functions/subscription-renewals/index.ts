import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RENEWAL_WINDOW_DAYS = 3;

const MONTHLY_PRICE: Record<string, number> = {
  starter: 0,
  pro: 149000,
  enterprise: 0,
};

function invoiceAmount(plan: string, billingCycle: string): number {
  const monthly = MONTHLY_PRICE[plan] ?? 0;
  if (monthly === 0) return 0;
  return billingCycle === "yearly" ? Math.round(monthly * 0.8) * 12 : monthly;
}

function nextPeriodEnd(currentEnd: string | null, billingCycle: string): string {
  const now = Date.now();
  const base = currentEnd ? new Date(currentEnd).getTime() : now;
  const start = new Date(Math.max(base, now));
  if (billingCycle === "yearly") {
    start.setFullYear(start.getFullYear() + 1);
  } else {
    start.setMonth(start.getMonth() + 1);
  }
  return start.toISOString();
}

interface DueSubscription {
  user_id: string;
  plan: string;
  billing_cycle: string;
  period_end: string;
}

// Scheduled by pg_cron (see migration 024). For active paid subscriptions
// nearing period_end with no outstanding renewal, create a Xendit renewal
// invoice and park its reference + URL. Payment (webhook / verify-on-return in
// the app) rolls period_end forward.
Deno.serve(async (): Promise<Response> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const xenditKey = Deno.env.get("XENDIT_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL") ?? "https://ngepos.com";

  if (!supabaseUrl || !serviceRoleKey || !xenditKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL / SERVICE_ROLE / XENDIT_SECRET_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = createClient(supabaseUrl, serviceRoleKey);
  const cutoff = new Date(
    Date.now() + RENEWAL_WINDOW_DAYS * 86_400_000,
  ).toISOString();

  const { data } = await client
    .from("subscriptions")
    .select("user_id, plan, billing_cycle, period_end")
    .eq("status", "active")
    .is("renewal_reference", null)
    .neq("plan", "starter")
    .lte("period_end", cutoff);

  const subs = ((data ?? []) as unknown as DueSubscription[]).filter(
    (sub) => invoiceAmount(sub.plan, sub.billing_cycle) > 0,
  );

  const auth = btoa(`${xenditKey}:`);
  let created = 0;

  for (const sub of subs) {
    const amount = invoiceAmount(sub.plan, sub.billing_cycle);
    const externalId = `renew-${sub.user_id}-${Date.now()}`;

    let payerEmail = "billing@ngepos.app";
    try {
      const { data: userData } = await client.auth.admin.getUserById(
        sub.user_id,
      );
      payerEmail = userData.user?.email ?? payerEmail;
    } catch (_error) {
      // keep fallback email
    }

    try {
      const response = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          external_id: externalId,
          amount,
          payer_email: payerEmail,
          description:
            `Perpanjangan langganan Ngepos ${sub.plan} (${sub.billing_cycle})`,
          currency: "IDR",
          success_redirect_url: `${appUrl}/billing?payment=success`,
          failure_redirect_url: `${appUrl}/billing?payment=failed`,
        }),
      });

      if (!response.ok) {
        console.error("Xendit invoice failed", response.status);
        continue;
      }

      const invoice = await response.json();

      await client
        .from("subscriptions")
        .update({
          renewal_reference: externalId,
          renewal_invoice_url: invoice.invoice_url,
        })
        .eq("user_id", sub.user_id);

      await client.from("invoices").insert({
        user_id: sub.user_id,
        plan: sub.plan,
        amount,
        status: "pending",
        billing_cycle: sub.billing_cycle,
        period_start: sub.period_end,
        period_end: nextPeriodEnd(sub.period_end, sub.billing_cycle),
      });

      created += 1;
    } catch (error) {
      console.error("Renewal failed for", sub.user_id, error);
    }
  }

  return new Response(JSON.stringify({ due: subs.length, created }), {
    headers: { "Content-Type": "application/json" },
  });
});
