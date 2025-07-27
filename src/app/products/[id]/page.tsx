import { getProductById } from '@/lib/data';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

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
