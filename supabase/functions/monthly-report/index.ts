import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface BusinessRow {
  id: string;
  owner_id: string;
  name: string;
  report_enabled: boolean;
  report_channel: "email" | "whatsapp";
  report_recipient: string | null;
}

interface SubscriptionRow {
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "past_due" | "cancelled";
  created_at: string;
}

interface TransactionItemRow {
  product_id: string;
  name: string;
  quantity: number;
  subtotal: number | string;
}

interface TransactionRow {
  total: number | string;
  transaction_items: TransactionItemRow[] | null;
}

interface ProductStockRow {
  track_stock: boolean;
  stock_qty: number | null;
  low_stock_threshold: number | null;
}

interface TopProduct {
  name: string;
  revenue: number;
}

interface MonthlyReport {
  businessName: string;
  periodLabel: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: TopProduct[];
  lowStockCount: number;
}

interface BatchResult {
  processed: number;
  sent: number;
  failed: number;
}

type SupabaseClient = ReturnType<typeof createClient>;

const formatRupiah = (value: number): string =>
  `Rp ${value.toLocaleString("id-ID")}`;

const buildEmailHtml = (report: MonthlyReport): string => {
  const rows = report.topProducts
    .map(
      (product, index) =>
        `<li>${index + 1}. ${product.name} — ${formatRupiah(product.revenue)}</li>`,
    )
    .join("");
  const topProductsHtml = rows.length > 0
    ? `<ul>${rows}</ul>`
    : "<p>No product sales recorded.</p>";

  return `<div>
  <h1>${report.businessName}</h1>
  <h2>Monthly report — ${report.periodLabel}</h2>
  <p><strong>Total revenue:</strong> ${formatRupiah(report.totalRevenue)}</p>
  <p><strong>Transactions:</strong> ${report.transactionCount}</p>
  <h3>Top products</h3>
  ${topProductsHtml}
  <p><strong>Low-stock products:</strong> ${report.lowStockCount}</p>
</div>`;
};

const buildPlainText = (report: MonthlyReport): string => {
  const topProducts = report.topProducts.length > 0
    ? report.topProducts
      .map(
        (product, index) =>
          `${index + 1}. ${product.name} — ${formatRupiah(product.revenue)}`,
      )
      .join("\n")
    : "No product sales recorded.";

  return `${report.businessName}
Monthly report — ${report.periodLabel}

Total revenue: ${formatRupiah(report.totalRevenue)}
Transactions: ${report.transactionCount}

Top products:
${topProducts}

Low-stock products: ${report.lowStockCount}`;
};

const aggregateTransactions = (
  transactions: TransactionRow[],
): { totalRevenue: number; transactionCount: number; topProducts: TopProduct[] } => {
  let totalRevenue = 0;
  const productTotals = new Map<string, TopProduct>();

  for (const transaction of transactions) {
    totalRevenue += Number(transaction.total);

    for (const item of transaction.transaction_items ?? []) {
      const existing = productTotals.get(item.product_id);
      const revenue = Number(item.subtotal);
      if (existing) {
        existing.revenue += revenue;
      } else {
        productTotals.set(item.product_id, {
          name: item.name,
          revenue,
        });
      }
    }
  }

  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    transactionCount: transactions.length,
    topProducts,
  };
};

const countLowStock = (products: ProductStockRow[]): number =>
  products.filter(
    (product) =>
      product.track_stock === true &&
      product.low_stock_threshold !== null &&
      product.stock_qty !== null &&
      product.stock_qty <= product.low_stock_threshold,
  ).length;

const sendEmail = async (
  report: MonthlyReport,
  recipient: string,
  apiKey: string,
  fromEmail: string,
): Promise<boolean> => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipient,
      subject: `Monthly report — ${report.businessName} (${report.periodLabel})`,
      html: buildEmailHtml(report),
    }),
  });

  return response.ok;
};

const sendWhatsApp = async (
  report: MonthlyReport,
  recipient: string,
  apiKey: string,
): Promise<boolean> => {
  const body = new URLSearchParams();
  body.set("target", recipient);
  body.set("message", buildPlainText(report));

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.ok;
};

const resolveOwnerPlan = async (
  client: SupabaseClient,
  ownerId: string,
): Promise<SubscriptionRow["plan"] | null> => {
  const { data } = await client
    .from("subscriptions")
    .select("plan, status, created_at")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1);

  const rows = (data ?? []) as SubscriptionRow[];
  if (rows.length === 0) {
    return null;
  }

  if (rows[0].status !== "active") {
    return null;
  }

  return rows[0].plan;
};

const buildReportForBusiness = async (
  client: SupabaseClient,
  business: BusinessRow,
  periodLabel: string,
  firstOfPrevMonth: string,
  firstOfThisMonth: string,
): Promise<MonthlyReport> => {
  const { data: transactionData } = await client
    .from("transactions")
    .select("total, transaction_items(product_id, name, quantity, subtotal)")
    .eq("business_id", business.id)
    .eq("payment_status", "paid")
    .gte("created_at", firstOfPrevMonth)
    .lt("created_at", firstOfThisMonth);

  const transactions = (transactionData ?? []) as unknown as TransactionRow[];
  const { totalRevenue, transactionCount, topProducts } = aggregateTransactions(
    transactions,
  );

  const { data: productData } = await client
    .from("products")
    .select("track_stock, stock_qty, low_stock_threshold")
    .eq("business_id", business.id);

  const products = (productData ?? []) as unknown as ProductStockRow[];
  const lowStockCount = countLowStock(products);

  return {
    businessName: business.name,
    periodLabel,
    totalRevenue,
    transactionCount,
    topProducts,
    lowStockCount,
  };
};

const deliverReport = async (
  business: BusinessRow,
  report: MonthlyReport,
  resendApiKey: string | undefined,
  resendFromEmail: string,
  fonnteApiKey: string | undefined,
): Promise<boolean> => {
  if (!business.report_recipient) {
    return false;
  }

  if (business.report_channel === "email") {
    if (!resendApiKey) {
      return false;
    }
    return await sendEmail(
      report,
      business.report_recipient,
      resendApiKey,
      resendFromEmail,
    );
  }

  if (business.report_channel === "whatsapp") {
    if (!fonnteApiKey) {
      return false;
    }
    return await sendWhatsApp(report, business.report_recipient, fonnteApiKey);
  }

  return false;
};

const computePeriod = (): {
  firstOfPrevMonth: string;
  firstOfThisMonth: string;
  periodLabel: string;
} => {
  const now = new Date();
  const firstOfThisMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const firstOfPrevMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0),
  );
  const periodLabel = firstOfPrevMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    firstOfPrevMonth: firstOfPrevMonth.toISOString(),
    firstOfThisMonth: firstOfThisMonth.toISOString(),
    periodLabel,
  };
};

Deno.serve(async (): Promise<Response> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "reports@ngepos.com";
  const fonnteApiKey = Deno.env.get("FONNTE_API_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = createClient(supabaseUrl, serviceRoleKey);
  const { firstOfPrevMonth, firstOfThisMonth, periodLabel } = computePeriod();

  const result: BatchResult = { processed: 0, sent: 0, failed: 0 };

  const { data: businessData } = await client
    .from("businesses")
    .select("id, owner_id, name, report_enabled, report_channel, report_recipient")
    .eq("report_enabled", true);

  const businesses = (businessData ?? []) as unknown as BusinessRow[];

  for (const business of businesses) {
    try {
      result.processed += 1;

      const plan = await resolveOwnerPlan(client, business.owner_id);
      if (plan !== "pro" && plan !== "enterprise") {
        continue;
      }

      const report = await buildReportForBusiness(
        client,
        business,
        periodLabel,
        firstOfPrevMonth,
        firstOfThisMonth,
      );

      const delivered = await deliverReport(
        business,
        report,
        resendApiKey,
        resendFromEmail,
        fonnteApiKey,
      );

      if (delivered) {
        result.sent += 1;
      } else {
        result.failed += 1;
      }
    } catch (_error) {
      result.failed += 1;
    }
  }

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
