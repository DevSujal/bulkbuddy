import type { Product } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Carrot, Droplets, Beef, Sprout, Tag, Users, Locate, Timer, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';

const categoryIcons: { [key: string]: React.ReactNode } = {
  Vegetable: <Carrot className="h-4 w-4" />,
  Pantry: <Droplets className="h-4 w-4" />,
  Meat: <Beef className="h-4 w-4" />,
  Default: <Sprout className="h-4 w-4" />,
};

export function ProductCard({ product }: { product: Product }) {
  const timeLimitDate = product.timeLimit instanceof Timestamp ? product.timeLimit.toDate() : new Date(product.timeLimit);
  const progress = Math.min((product.currentQuantity / product.minBulkQuantity) * 100, 100);
  const isFulfilled = progress >= 100;
  const isExpired = new Date() > timeLimitDate;
  
  const timeLeft = !isFulfilled && !isExpired ? formatDistanceToNow(timeLimitDate, { addSuffix: true }) : 'Ended';

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
         <Image
            src={product.imageUrl || 'https://placehold.co/600x400.png'}
            alt={product.name}
            fill
            className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <Badge variant="secondary" className="mb-2 inline-flex items-center gap-1.5">
                    {categoryIcons[product.category] || categoryIcons.Default}
                    {product.category}
                </Badge>
                <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
                <CardDescription>by {product.supplierName}</CardDescription>
            </div>
            {isFulfilled && <Badge variant="default" className="bg-green-500 text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" />Fulfilled</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} aria-label={`${Math.round(progress)}% funded`} />
          <div className="flex justify-between items-baseline mt-1 text-xs text-muted-foreground">
            <span>{product.currentQuantity}kg</span>
            <span>{product.minBulkQuantity}kg</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2"><Tag className="h-4 w-4 shrink-0"/><span>${product.unitPrice.toFixed(2)} per kg</span></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0"/><span>{product.contributions.length} vendors</span></div>
            {product.location && <div className="flex items-center gap-2"><Locate className="h-4 w-4 shrink-0"/><span>{product.location}</span></div>}
            <div className="flex items-center gap-2"><Timer className="h-4 w-4 shrink-0"/><span>
                {isExpired && !isFulfilled ? 'Closed' : `Closes ${timeLeft}`}
            </span></div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full" variant={isFulfilled ? "secondary" : "default"} disabled={isFulfilled || isExpired}>
            {isFulfilled ? 'View Details' : 'View Deal'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
