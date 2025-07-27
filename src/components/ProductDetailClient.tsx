'use client';

import type { Product, VendorContribution } from '@/lib/types';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tag, Users, Locate, Timer, CheckCircle2, User, Package, Sprout, Carrot, Droplets, Beef, AlertTriangle, LogIn } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { addContribution, getProductById } from '@/lib/data';
import { useRouter } from 'next/navigation';

const categoryIcons: { [key: string]: React.ReactNode } = {
  Vegetable: <Carrot className="h-5 w-5" />,
  Pantry: <Droplets className="h-5 w-5" />,
  Meat: <Beef className="h-5 w-5" />,
  Default: <Sprout className="h-5 w-5" />,
};

export function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [contribution, setContribution] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const timeLimitDate = new Date(product.timeLimit);
  
  const hasJoined = user ? product.contributions.some(c => c.vendorId === user.uid) : false;

  const progress = Math.min((product.currentQuantity / product.minBulkQuantity) * 100, 100);
  const isFulfilled = progress >= 100;
  const isExpired = new Date() > timeLimitDate;
  const canJoin = user && user.role === 'vendor' && !isFulfilled && !isExpired && !hasJoined;

  const timeLeft = !isFulfilled && !isExpired ? formatDistanceToNow(timeLimitDate, { addSuffix: true }) : 'Ended';

  const handleJoinOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const quantity = parseInt(contribution, 10);
    if (isNaN(quantity) || quantity <= 0) {
        toast({ title: 'Error', description: 'Please enter a valid quantity.', variant: 'destructive' });
        return;
    }
    if (hasJoined) {
        toast({ title: 'Error', description: 'You have already joined this group order.', variant: 'destructive' });
        return;
    }

    startTransition(async () => {
        try {
            const newContribution: VendorContribution = {
                vendorId: user.uid,
                vendorName: user.name,
                quantity,
            };

            await addContribution(product.id, newContribution);

            // Fetch the updated product data to reflect changes
            const updatedProductData = await getProductById(product.id);
            if(updatedProductData) {
                const updatedProduct: Product = {
                    ...updatedProductData,
                    timeLimit: (updatedProductData.timeLimit as any).toDate().toISOString(),
                };
                setProduct(updatedProduct);
            }

            setContribution('');
            toast({
                title: 'Success!',
                description: `You've joined the group buy for ${quantity}kg of ${product.name}.`,
            });
            router.refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to join order. Please try again.', variant: 'destructive' });
        }
    });
  };

  const renderJoinCardContent = () => {
    if (isFulfilled) {
      return (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 !text-green-600" />
          <AlertTitle>Order Fulfilled!</AlertTitle>
          <AlertDescription>
            The minimum quantity has been reached. The supplier will process the order soon.
          </AlertDescription>
        </Alert>
      );
    }
    if (isExpired) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Order Expired</AlertTitle>
          <AlertDescription>
            This group order did not meet its goal in time.
          </AlertDescription>
        </Alert>
      );
    }
    if (!user) {
        return (
            <Alert>
                <LogIn className="h-4 w-4" />
                <AlertTitle>You are not logged in</AlertTitle>
                <AlertDescription>
                    Please <Link href="/login" className="font-bold hover:underline">log in</Link> or <Link href="/signup" className="font-bold hover:underline">sign up</Link> to join this order.
                </AlertDescription>
            </Alert>
        )
    }
    if (user.role === 'supplier') {
        return (
             <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Suppliers cannot join orders</AlertTitle>
                <AlertDescription>
                    Your account type is 'Supplier'. Only vendors can contribute to orders.
                </AlertDescription>
            </Alert>
        )
    }
    if (hasJoined) {
      return (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Thanks for your contribution!</AlertTitle>
          <AlertDescription>
            You're part of this group order. We'll notify you upon fulfillment.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <form onSubmit={handleJoinOrder} className="space-y-4">
        <div>
          <Label htmlFor="vendorName">Your Name</Label>
          <Input 
            id="vendorName"
            value={user.name}
            disabled={true}
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity you need (kg)</Label>
          <Input
            id="quantity"
            type="number"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder="e.g., 50"
            min="1"
            disabled={!canJoin || isPending}
          />
        </div>
        <Button type="submit" className="w-full" disabled={!canJoin || isPending}>
          {isPending ? 'Joining...' : 'Contribute and Join'}
        </Button>
      </form>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary rounded-lg">
                        {categoryIcons[product.category] || categoryIcons.Default}
                    </div>
                    <div>
                        <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                        <CardTitle className="font-headline text-3xl">{product.name}</CardTitle>
                        <CardDescription>by {product.supplierName}</CardDescription>
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">${product.unitPrice.toFixed(2)}</p><p>per kg</p></div></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">{product.contributions.length}</p><p>Vendors</p></div></div>
                <div className="flex items-center gap-2"><Locate className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground truncate">{product.location || 'N/A'}</p><p>Location</p></div></div>
                <div className="flex items-center gap-2"><Timer className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">{isExpired && !isFulfilled ? 'Closed' : `Closes ${timeLeft}`}</p><p>Time limit</p></div></div>
             </div>
            <Separator />
            <div>
              <Label className="text-base">Order Progress</Label>
              <div className="flex justify-between items-baseline mb-1 mt-2">
                <span className="text-sm font-medium text-foreground">{product.currentQuantity.toLocaleString()}kg contributed</span>
                <span className="text-sm text-muted-foreground">Goal: {product.minBulkQuantity.toLocaleString()}kg</span>
              </div>
              <Progress value={progress} className="h-4" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Vendor Contributions</CardTitle></CardHeader>
            <CardContent>
                {product.contributions.length > 0 ? (
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {product.contributions.map((c) => (
                            <li key={c.vendorId} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground"/>
                                    <span>{c.vendorName}</span>
                                </div>
                                <div className="flex items-center gap-2 font-medium">
                                    <Package className="h-4 w-4 text-muted-foreground"/>
                                    <span>{c.quantity} kg</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Be the first to join!</p>
                )}
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Join this Group Order</CardTitle>
          </CardHeader>
          <CardContent>
            {renderJoinCardContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
