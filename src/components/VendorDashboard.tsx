
'use client';

import type { User, Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import { getProductsByVendorContribution } from '@/lib/data';
import { ProductCard } from './ProductCard';

export function VendorDashboard({ user }: { user: User }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (user) {
        setLoading(true);
        const contributedProducts = await getProductsByVendorContribution(user.uid);
        setProducts(contributedProducts);
        setLoading(false);
      }
    }
    fetchProducts();
  }, [user]);

  return (
    <div className="space-y-8">
        <div className="text-center md:text-left">
            <h1 className="text-4xl font-headline font-bold text-foreground">
                Vendor Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Track the group orders you have joined.
            </p>
        </div>

      {loading ? (
        <p>Loading your contributed orders...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">You haven't joined any group orders yet.</p>
      )}
    </div>
  );
}
