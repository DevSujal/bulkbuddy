import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

export default function Home() {
  const products: Product[] = getProducts();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Current Group Orders
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Join a group buy to get the best prices on raw materials.
        </p>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No active orders</h3>
            <p className="text-muted-foreground mt-2">Check back later or create a new listing!</p>
        </div>
      )}
    </div>
  );
}
