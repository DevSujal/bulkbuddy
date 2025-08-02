
import { getProductById } from '@/lib/data';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const productData = await getProductById(params.id);

  if (!productData) {
    notFound();
    return;
  }

  // Convert Timestamp to a serializable format (ISO string) if it's a Timestamp
  const product: Product = {
    ...productData,
    timeLimit: productData.timeLimit instanceof Timestamp 
        ? productData.timeLimit.toDate().toISOString()
        : productData.timeLimit,
    reviews: productData.reviews.map(review => ({
        ...review,
        createdAt: review.createdAt instanceof Timestamp ? review.createdAt.toDate().toISOString() : review.createdAt
    })) as any,
  };

  return (
    <div>
        <Link href="/" className="mb-8 inline-block">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to All Orders
            </Button>
        </Link>
        <ProductDetailClient product={product} />
    </div>
  );
}
