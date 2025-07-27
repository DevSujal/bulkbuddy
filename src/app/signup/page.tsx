import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center">
       <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold text-foreground">
                Create an Account
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Join BulkBuddy as a Vendor or a Supplier.
            </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
