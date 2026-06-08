'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category, Product } from '@/types/product';
import type { CartItem } from '@/types/pos';

interface ProductSelectorProps {
  businessId: string;
  onSelectProduct: (item: CartItem) => void;
}

export function ProductSelector({ businessId, onSelectProduct }: ProductSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`/api/categories?businessId=${businessId}`),
          fetch(`/api/products?businessId=${businessId}`),
        ]);

        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch products');
        }

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        setCategories(categoriesData);
        setProducts(productsData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [businessId]);

  if (loading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="font-semibold mb-3">Categories</h2>
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-3 cursor-pointer hover:border-blue-500 transition flex flex-col"
              onClick={() =>
                onSelectProduct({
                  product_id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  discount_amount: 0,
                })
              }
            >
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full h-24 object-cover rounded mb-2" />
              )}
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <p className="text-lg font-bold text-blue-600 mt-auto">IDR {product.price.toLocaleString('id-ID')}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
