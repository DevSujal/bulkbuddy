import type { Product } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Carrot, Droplets, Beef, Sprout, Tag, Users, Locate, Timer, CheckCircle2, Package, XCircle, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const categoryIcons: { [key: string]: React.ReactNode } = {
  Vegetable: <Carrot className="h-4 w-4" />,
  Pantry: <Droplets className="h-4 w-4" />,
  Meat: <Beef className="h-4 w-4" />,
  Default: <Sprout className="h-4 w-4" />,
};

const statusInfo: { [key: string]: { icon: React.ReactNode; text: string; className: string; } } = {
    Active: { icon: <Timer className="h-4 w-4" />, text: 'Active', className: 'bg-blue-100 text-blue-800' },
    Fulfilled: { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Fulfilled', className: 'bg-green-100 text-green-800' },
    Shipped: { icon: <Truck className="h-4 w-4" />, text: 'Shipped', className: 'bg-purple-100 text-purple-800' },
    Cancelled: { icon: <XCircle className="h-4 w-4" />, text: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

export function ProductCard({ product }: { product: Product }) {
  const timeLimitDate = product.timeLimit instanceof Timestamp ? product.timeLimit.toDate() : new Date(product.timeLimit);
  const progress = Math.min((product.currentQuantity / product.minBulkQuantity) * 100, 100);
  const goalReached = product.currentQuantity >= product.minBulkQuantity;
  const isExpired = new Date() > timeLimitDate;
  
  const timeLeft = product.status === 'Active' && !isExpired ? formatDistanceToNow(timeLimitDate, { addSuffix: true }) : 'Ended';
  
  const currentStatusInfo = statusInfo[product.status] || statusInfo.Active;
  const isJoinable = product.status === 'Active' && !isExpired;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
         <Image
            src={product.imageUrl || 'https://placehold.co/600x400.png'}
            alt={product.name}
            fill
            className="object-cover"
        />
        <Badge className={cn("absolute top-2 right-2", currentStatusInfo.className)}>
            {currentStatusInfo.icon}
            <span className="ml-1.5">{currentStatusInfo.text}</span>
        </Badge>
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
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-muted-foreground">Progress</span>
             <span className={cn("text-sm font-semibold", goalReached && "text-green-600")}>{Math.round(progress)}%</span>
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
                {product.status === 'Active' && !isExpired ? `Closes ${timeLeft}` : `Closed`}
            </span></div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full" variant={isJoinable ? "default" : "secondary"}>
             {isJoinable ? 'View Deal' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
