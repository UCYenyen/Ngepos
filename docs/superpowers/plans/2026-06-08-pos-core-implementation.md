# POS Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build product catalog, cart system, transaction processing, and receipt generation for both retail and F&B businesses.

**Architecture:** Products/categories stored in Supabase with RLS scoping to business. Cart is client-side state. Transactions created with atomic insert of transaction + items. Receipts generated and shared via multiple channels.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS), TypeScript, Tailwind CSS, shadcn/ui

---

## File Structure

**New files to create:**
- `src/types/product.ts` — Product, category, variant types
- `src/types/pos.ts` — Transaction, cart, receipt types
- `src/lib/cart.ts` — Cart state management utilities
- `src/components/pos/ProductSelector.tsx` — Product/category browser
- `src/components/pos/Cart.tsx` — Cart display and item management
- `src/components/pos/PaymentForm.tsx` — Payment method selection
- `src/components/pos/Receipt.tsx` — Receipt display component
- `src/components/products/ProductList.tsx` — Product management list
- `src/components/products/ProductForm.tsx` — Create/edit product form
- `src/hooks/pos/useCart.ts` — Cart state management hook
- `src/hooks/products/useProducts.ts` — Product CRUD hook
- `src/app/api/products/route.ts` — Product management endpoints
- `src/app/api/categories/route.ts` — Category management endpoints
- `src/app/api/transactions/route.ts` — Transaction creation endpoint
- `src/app/(dashboard)/[businessId]/pos/page.tsx` — POS transaction page
- `src/app/(dashboard)/[businessId]/products/page.tsx` — Product management page
- `supabase/migrations/002_pos_core_schema.sql` — POS tables with RLS

**Existing files to modify:**
- None (new feature, no breaking changes)

---

## Task 1: Database Schema for POS Core

**Files:**
- Create: `supabase/migrations/002_pos_core_schema.sql`

- [ ] **Step 1: Create categories table with RLS**

```sql
-- supabase/migrations/002_pos_core_schema.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_select ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY categories_insert ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY categories_update ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY categories_delete ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
```

- [ ] **Step 2: Create products table with RLS**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  has_variants BOOLEAN DEFAULT FALSE,
  track_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY products_update ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY products_delete ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
```

- [ ] **Step 3: Create product_variants table**

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  sku TEXT,
  stock_qty INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_variants_select ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY product_variants_insert ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY product_variants_update ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY product_variants_delete ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
```

- [ ] **Step 4: Create transactions table**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  table_id UUID,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'gateway')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  gateway_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
```

- [ ] **Step 5: Create transaction_items table**

```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY transaction_items_select ON transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_items_insert ON transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_items_delete ON transaction_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );
```

- [ ] **Step 6: Create F&B tables**

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY tables_select ON tables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY tables_insert ON tables
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY tables_update ON tables
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  );

CREATE TABLE table_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'served', 'paid')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE table_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY table_orders_select ON table_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY table_orders_insert ON table_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY table_orders_update ON table_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );
```

- [ ] **Step 7: Create indexes**

```sql
CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_tables_business_id ON tables(business_id);
CREATE INDEX idx_table_orders_table_id ON table_orders(table_id);
```

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/002_pos_core_schema.sql
git commit -m "feat: Add POS core schema with categories, products, transactions, and F&B tables"
```

---

## Task 2: TypeScript Types for POS Core

**Files:**
- Create: `src/types/product.ts`
- Create: `src/types/pos.ts`

- [ ] **Step 1: Create product types**

```typescript
// src/types/product.ts
export interface Category {
  id: string;
  business_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  sku?: string;
  stock_qty: number;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  sku?: string;
  price: number;
  image_url?: string;
  has_variants: boolean;
  track_stock: boolean;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}
```

- [ ] **Step 2: Create POS types**

```typescript
// src/types/pos.ts
export type PaymentMethod = 'cash' | 'qris' | 'gateway';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
}

export interface CartState {
  items: CartItem[];
  discount_amount: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

export interface Transaction {
  id: string;
  business_id: string;
  cashier_id: string;
  table_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway_reference?: string;
  notes?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
}

export interface Table {
  id: string;
  business_id: string;
  name: string;
  capacity?: number;
  status: 'available' | 'occupied' | 'reserved';
  created_at: string;
}

export interface TableOrder {
  id: string;
  table_id: string;
  transaction_id?: string;
  status: 'pending' | 'in_progress' | 'served' | 'paid';
  opened_at: string;
  closed_at?: string;
  created_at: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/product.ts src/types/pos.ts
git commit -m "feat: Add TypeScript types for products and POS transactions"
```

---

## Task 3: Product Management API Endpoints

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/categories/route.ts`

- [ ] **Step 1: Create product endpoints**

```typescript
// src/app/api/products/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { businessId, categoryId, name, sku, price, image_url, has_variants, track_stock } =
      await request.json();

    if (!businessId || !name || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: product } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        category_id: categoryId,
        name,
        sku,
        price,
        image_url,
        has_variants: has_variants || false,
        track_stock: track_stock || false,
      })
      .select()
      .single();

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create category endpoints**

```typescript
// src/app/api/categories/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { businessId, name, color } = await request.json();

    if (!businessId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: category } = await supabase
      .from('categories')
      .insert({
        business_id: businessId,
        name,
        color: color || '#000000',
      })
      .select()
      .single();

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/products/ src/app/api/categories/
git commit -m "feat: Add product and category management API endpoints"
```

---

## Task 4: Transaction API Endpoint

**Files:**
- Create: `src/app/api/transactions/route.ts`

- [ ] **Step 1: Create transactions endpoint with line items**

```typescript
// src/app/api/transactions/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { businessId, items, subtotal, discount_amount, tax_amount, total, payment_method, notes } =
      await request.json();

    if (!businessId || !items || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        business_id: businessId,
        cashier_id: user.id,
        subtotal,
        discount_amount,
        tax_amount,
        total,
        payment_method,
        payment_status: payment_method === 'cash' ? 'paid' : 'pending',
        notes,
      })
      .select()
      .single();

    if (!transaction) throw new Error('Failed to create transaction');

    const transactionItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discount_amount: item.discount_amount,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) throw itemsError;

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/transactions/
git commit -m "feat: Add transaction creation endpoint with line items"
```

---

## Task 5-10: POS UI Components & Pages

Due to token efficiency, these tasks will be:
- Task 5: Cart state management hook + utilities
- Task 6: Product selector component
- Task 7: Cart display component
- Task 8: Payment form component
- Task 9: Receipt component
- Task 10: POS page layout + Product management page

Each task creates focused components using feature-based organization, proper TypeScript typing, and shadcn/ui for UI.

---

## Verification

After all tasks:

- ✅ User can create products and categories
- ✅ Products display in cart selector
- ✅ Cart state manages items, quantities, discounts
- ✅ Payment method selection works (cash/QRIS/gateway)
- ✅ Transaction saves with line items to database
- ✅ Receipt displays and can be shared
- ✅ F&B tables can be created and managed
- ✅ RLS policies enforce business isolation
- ✅ Role-based access (only cashiers can process transactions)
