import { CreateProductForm } from "@/components/CreateProductForm";

export default function CreateProductPage() {
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
