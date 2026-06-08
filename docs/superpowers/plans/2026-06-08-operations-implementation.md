# Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build inventory management (Pro/Enterprise), staff role-based permissions, and low-stock alerts.

**Architecture:** Stock movements tracked atomically with each transaction. Staff roles enforced via RLS. Low-stock alerts triggered on transaction save or manual adjustments.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS), TypeScript, Tailwind CSS, shadcn/ui

---

## File Structure

**New files to create:**
- `src/types/operations.ts` — Inventory and staff types
- `src/lib/permissions.ts` — Role-based permission checks
- `src/app/api/inventory/route.ts` — Stock management endpoint
- `src/app/api/inventory/movements/route.ts` — Stock movement history
- `src/app/api/staff/route.ts` — Staff management endpoint
- `src/components/inventory/StockList.tsx` — Inventory display component
- `src/components/inventory/StockAdjustment.tsx` — Manual adjustment form
- `src/components/staff/StaffList.tsx` — Staff member list with roles
- `src/components/staff/InviteForm.tsx` — Invite staff form
- `src/app/(dashboard)/[businessId]/inventory/page.tsx` — Inventory management page
- `src/app/(dashboard)/[businessId]/staff/page.tsx` — Staff management page
- `supabase/migrations/003_operations_schema.sql` — Inventory tables with RLS

**Existing files to modify:**
- `src/app/api/transactions/route.ts` — Add automatic stock decrements on transaction

---

## Task 1: Database Schema for Operations

Create `supabase/migrations/003_operations_schema.sql` with:
- `stock_movements` table (sale, restock, adjustment, damage tracking)
- `suppliers` table (supplier contact management)
- RLS policies for business-scoped access
- Indexes on business_id and created_at

---

## Task 2: TypeScript Types for Operations

Create `src/types/operations.ts` with:
- StockMovement, StockMovementType
- Supplier, InventoryItem types
- StaffPermissions interface

Create `src/lib/permissions.ts` with:
- Role-based permission checking functions
- canManageInventory, canManageStaff, canApplyDiscount functions

---

## Task 3: Inventory APIs

Create `src/app/api/inventory/route.ts` with:
- GET /api/inventory (fetch products with current stock)
- POST /api/inventory/adjust (manual stock adjustment)

Create `src/app/api/inventory/movements/route.ts` with:
- GET /api/inventory/movements (stock movement history)

---

## Task 4: Staff Management APIs

Create `src/app/api/staff/route.ts` with:
- GET /api/staff (list business staff)
- POST /api/staff/invite (send staff invitation)
- PATCH /api/staff/:id (update staff role)

---

## Task 5: Inventory Components

Create `src/components/inventory/StockList.tsx` — displays products with current stock
Create `src/components/inventory/StockAdjustment.tsx` — form for manual adjustments

---

## Task 6: Staff Components

Create `src/components/staff/StaffList.tsx` — display staff with roles
Create `src/components/staff/InviteForm.tsx` — invite new staff form

---

## Task 7: Management Pages

Create `src/app/(dashboard)/[businessId]/inventory/page.tsx` — full inventory management
Create `src/app/(dashboard)/[businessId]/staff/page.tsx` — full staff management

---

## Task 8: Transaction Integration

Modify `src/app/api/transactions/route.ts` to:
- Decrement stock on transaction creation
- Create stock_movement records
- Trigger low-stock alerts

---

## Task 9: Low-Stock Alerts

Add alert logic:
- Check stock levels on transaction/adjustment
- Send email alerts for low stock
- Display in dashboard

---

## Task 10: Permissions Enforcement

Add middleware to all pages:
- Check user's business role
- Enforce feature limits (inventory for Pro+)
- Hide/disable UI elements based on permissions

---

## Verification

After completion:
- ✅ Stock decrements on transactions
- ✅ Manual adjustments tracked
- ✅ Low-stock alerts working
- ✅ Staff can only access assigned business
- ✅ Permissions enforced on UI and API level
- ✅ Role-based feature access working
