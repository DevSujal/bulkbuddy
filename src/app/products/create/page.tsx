'use client';
import { CreateProductForm } from "@/components/CreateProductForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateProductPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'supplier') {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="max-w-2xl mx-auto">
             <div className="text-center mb-8">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
            </div>
            <Card>
                <CardContent className="pt-6 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-2 gap-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      )
    }
    
    if (!user || user.role !== 'supplier') {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-headline font-bold text-foreground">
                    Create a New Group Order
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    List your raw materials and let vendors group-buy from you.
                </p>
            </div>
            <CreateProductForm />
        </div>
    );
}
