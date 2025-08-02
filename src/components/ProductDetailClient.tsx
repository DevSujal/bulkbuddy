
'use client';

import type { Product, ProductStatus, VendorContribution, Review } from '@/lib/types';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tag, Users, Locate, Timer, CheckCircle2, User, Package, Sprout, Carrot, Droplets, Beef, AlertTriangle, LogIn, Truck, XCircle, Edit, Trash2, Star, MessageSquare } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { addContribution, getProductById, updateProductStatus, deleteProduct, addReview } from '@/lib/data';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from './ui/textarea';
import { Timestamp } from 'firebase/firestore';


const categoryIcons: { [key: string]: React.ReactNode } = {
  Vegetable: <Carrot className="h-5 w-5" />,
  Pantry: <Droplets className="h-5 w-5" />,
  Meat: <Beef className="h-5 w-5" />,
  Default: <Sprout className="h-5 w-5" />,
};

const statusInfo: { [key: string]: { icon: React.ReactNode; text: string; className: string; } } = {
    Active: { icon: <Timer className="h-4 w-4" />, text: 'Active', className: 'bg-blue-100 text-blue-800' },
    Fulfilled: { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Fulfilled', className: 'bg-green-100 text-green-800' },
    Shipped: { icon: <Truck className="h-4 w-4" />, text: 'Shipped', className: 'bg-purple-100 text-purple-800' },
    Cancelled: { icon: <XCircle className="h-4 w-4" />, text: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

function ReviewForm({ product, onReviewAdded }: { product: Product, onReviewAdded: (newReview: Review) => void }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast({ title: 'Error', description: 'Please select a star rating.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const newReviewData = {
                vendorId: user.uid,
                vendorName: user.name,
                rating,
                comment,
            };
            await addReview(product.id, product.supplierId, newReviewData);
            onReviewAdded({ ...newReviewData, id: 'temp', createdAt: new Date().toISOString() } as any);
            toast({ title: 'Success', description: 'Your review has been submitted.' });
            setRating(0);
            setComment('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to submit review. Please try again.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Your Rating</Label>
                <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                'h-6 w-6 cursor-pointer transition-colors',
                                (hoverRating >= star || rating >= star)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about your experience..."
                    disabled={isSubmitting}
                />
            </div>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    );
}


function SupplierActions({ product, onStatusChange }: { product: Product; onStatusChange: (newStatus: ProductStatus) => void; }) {
    const [selectedStatus, setSelectedStatus] = useState<ProductStatus>(product.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            await updateProductStatus(product.id, selectedStatus);
            onStatusChange(selectedStatus);
            toast({
                title: 'Status Updated',
                description: `Order status changed to "${selectedStatus}".`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update status. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProduct(product.id);
            toast({
                title: 'Listing Deleted',
                description: `The listing for "${product.name}" has been removed.`,
            });
            router.push('/dashboard');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete listing. Please try again.',
                variant: 'destructive',
            });
            setIsDeleting(false);
        }
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Edit className="h-5 w-5"/> Manage Listing</CardTitle>
                <CardDescription>Update the status or delete this listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Label>Order Status</Label>
                 <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProductStatus)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Change status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                 <Button className="w-full" onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === product.status}>
                    {isUpdating ? 'Updating...' : 'Save Status'}
                </Button>
                <Separator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        {isDeleting ? 'Deleting...' : 'Delete Listing'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        product listing and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

            </CardContent>
        </Card>
    )
}

export function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [contribution, setContribution] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const timeLimitDate = new Date(product.timeLimit as string);
  
  const hasContributed = user ? product.contributions.some(c => c.vendorId === user.uid) : false;
  const hasReviewed = user ? product.reviews.some(r => r.vendorId === user.uid) : false;

  const progress = Math.min((product.currentQuantity / product.minBulkQuantity) * 100, 100);
  const goalReached = product.currentQuantity >= product.minBulkQuantity;
  const isExpired = new Date() > timeLimitDate;
  const canJoin = user && user.role === 'vendor' && product.status === 'Active' && !isExpired && !hasContributed;
  const canReview = user && user.role === 'vendor' && hasContributed && !hasReviewed && (product.status === 'Fulfilled' || product.status === 'Shipped');


  const timeLeft = product.status === 'Active' && !isExpired ? formatDistanceToNow(timeLimitDate, { addSuffix: true }) : 'Ended';
  
  const currentStatusInfo = statusInfo[product.status] || statusInfo.Active;
  const isSupplier = user?.uid === product.supplierId;

  const handleJoinOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const quantity = parseInt(contribution, 10);
    if (isNaN(quantity) || quantity <= 0) {
        toast({ title: 'Error', description: 'Please enter a valid quantity.', variant: 'destructive' });
        return;
    }
    if (hasContributed) {
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
                    timeLimit: updatedProductData.timeLimit instanceof Timestamp 
                        ? updatedProductData.timeLimit.toDate().toISOString()
                        : updatedProductData.timeLimit,
                    reviews: updatedProductData.reviews.map(review => ({
                        ...review,
                        createdAt: review.createdAt instanceof Timestamp ? review.createdAt.toDate().toISOString() : review.createdAt
                    })) as any,
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
            console.error(error);
            toast({ title: 'Error', description: 'Failed to join order. Please try again.', variant: 'destructive' });
        }
    });
  };

  const handleStatusChange = (newStatus: ProductStatus) => {
    setProduct(prev => ({ ...prev, status: newStatus }));
    router.refresh();
  };

   const handleReviewAdded = (newReview: Review) => {
        setProduct(prev => {
            const updatedReviews = [...prev.reviews, newReview];
            const newReviewCount = updatedReviews.length;
            const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newReviewCount;
            return {
                ...prev,
                reviews: updatedReviews,
                reviewCount: newReviewCount,
                averageRating: newAverageRating
            };
        });
        router.refresh();
    };

  const renderJoinCardContent = () => {
    if (product.status === 'Fulfilled') {
      return (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 !text-green-600" />
          <AlertTitle>Order Fulfilled!</AlertTitle>
          <AlertDescription>
            The minimum quantity was reached. The supplier is processing the order.
          </AlertDescription>
        </Alert>
      );
    }
    if (product.status === 'Shipped') {
        return (
          <Alert className="bg-purple-50 border-purple-200 text-purple-800">
            <Truck className="h-4 w-4 !text-purple-600" />
            <AlertTitle>Order Shipped!</AlertTitle>
            <AlertDescription>
              This order has been shipped by the supplier.
            </AlertDescription>
          </Alert>
        );
      }
    if (product.status === 'Cancelled' || (isExpired && !goalReached)) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{product.status === 'Cancelled' ? 'Order Cancelled' : 'Order Expired'}</AlertTitle>
          <AlertDescription>
            This group order did not proceed.
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
    if (isSupplier) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>This is your listing</AlertTitle>
                <AlertDescription>
                   You can manage this listing below.
                </AlertDescription>
            </Alert>
        );
    }
    if (hasContributed) {
      return (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Thanks for your contribution!</AlertTitle>
          <AlertDescription>
            You're part of this group order. You will be notified of any status updates.
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
           <div className="relative h-64 w-full">
            <Image
                src={product.imageUrl || 'https://placehold.co/600x400.png'}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint="product image"
            />
           </div>
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
                <Badge className={cn("text-base", currentStatusInfo.className)}>
                    {currentStatusInfo.icon}
                    <span className="ml-1.5">{currentStatusInfo.text}</span>
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             {product.description && (
                <p className="text-lg text-muted-foreground italic">
                  "{product.description}"
                </p>
             )}
             <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">${product.unitPrice.toFixed(2)}</p><p>per kg</p></div></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">{product.contributions.length}</p><p>Vendors</p></div></div>
                <div className="flex items-center gap-2"><Locate className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground truncate">{product.location || 'N/A'}</p><p>Location</p></div></div>
                <div className="flex items-center gap-2"><Timer className="h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold text-foreground">{product.status === 'Active' && !isExpired ? `Closes ${timeLeft}` : 'Closed'}</p><p>Time limit</p></div></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5"/> Reviews ({product.reviewCount || 0})</CardTitle></CardHeader>
            <CardContent>
                {canReview && (
                    <>
                        <ReviewForm product={product} onReviewAdded={handleReviewAdded} />
                        <Separator className="my-6" />
                    </>
                )}
                {product.reviews.length > 0 ? (
                    <ul className="space-y-6">
                       {product.reviews.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()).map((review) => (
                           <li key={review.id} className="flex gap-4">
                               <User className="h-8 w-8 text-muted-foreground mt-1" />
                               <div className="flex-1">
                                   <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{review.vendorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(parseISO(review.createdAt as string), "PPP")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                                            ))}
                                        </div>
                                   </div>
                                    {review.comment && <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>}
                               </div>
                           </li>
                       ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">This product has no reviews yet.</p>
                )}
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

      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Join this Group Order</CardTitle>
          </CardHeader>
          <CardContent>
            {renderJoinCardContent()}
          </CardContent>
        </Card>
        {isSupplier && <SupplierActions product={product} onStatusChange={handleStatusChange} />}
      </div>
    </div>
  );
}
