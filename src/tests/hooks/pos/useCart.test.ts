import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/pos/useCart';
import type { CartItem } from '@/types/pos';

const items: CartItem[] = [
  {
    product_id: 'a',
    name: 'Kopi Susu',
    price: 10000,
    quantity: 2,
    discount_amount: 0,
  },
  {
    product_id: 'b',
    name: 'Teh Tarik',
    price: 5000,
    quantity: 1,
    discount_amount: 0,
  },
];

describe('useCart loadItems (resume an open tab)', () => {
  it('replaces items and recomputes totals at the tax rate', () => {
    const { result } = renderHook(() => useCart(0.1));

    act(() => result.current.loadItems(items));

    expect(result.current.cart.items).toHaveLength(2);
    expect(result.current.cart.subtotal).toBe(25000);
    expect(result.current.cart.tax_amount).toBe(2500);
    expect(result.current.cart.total).toBe(27500);
  });

  it('overwrites whatever was already in the cart', () => {
    const { result } = renderHook(() => useCart(0.1));

    act(() =>
      result.current.addItem({
        product_id: 'x',
        name: 'Lama',
        price: 9999,
        quantity: 5,
        discount_amount: 0,
      })
    );
    act(() =>
      result.current.loadItems([
        {
          product_id: 'a',
          name: 'Kopi Susu',
          price: 10000,
          quantity: 1,
          discount_amount: 0,
        },
      ])
    );

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].product_id).toBe('a');
    expect(result.current.cart.subtotal).toBe(10000);
  });
});
