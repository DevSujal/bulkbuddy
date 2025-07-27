'use client';
import { CreateProductForm } from "@/components/CreateProductForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function CreateProductPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'supplier') {
            router.push('/');
        }
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user || user.role !== 'supplier') {
        return (
            <div className="flex justify-center items-center h-64">
                <Card className="p-8">
                    <CardContent className="flex flex-col items-center gap-4 text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                        <h2 className="text-2xl font-bold">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You must be a supplier to create a new listing.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
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
