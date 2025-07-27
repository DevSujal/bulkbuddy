import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold text-foreground">
                Login to BulkBuddy
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Welcome back! Please enter your details.
            </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
