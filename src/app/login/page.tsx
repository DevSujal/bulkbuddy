"use client";

import { useRef, useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import type { UseFormReturn } from "react-hook-form";

const demoAccounts = [
  { email: "jondoe@me.com", password: "password", role: "street vendor" },
  { email: "jondoe@you.com", password: "password", role: "supplier" }
];

export default function LoginPage() {
  const formRef = useRef<UseFormReturn | null>(null);

  const handleUseDemo = (email: string, password: string) => {
    if (formRef.current) {
      formRef.current.setValue("email", email);
      formRef.current.setValue("password", password);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-foreground">
            Login to BulkBuddy
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Pass the form ref using onFormReady */}
        <LoginForm onFormReady={(form) => (formRef.current = form)} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2 text-foreground">Demo Accounts</h2>
          <div className="space-y-4">
            {demoAccounts.map((account, index) => (
              <div
                key={index}
                className="bg-muted rounded p-4 text-sm flex justify-between items-center"
              >
                <div>
                  <p><strong>Role:</strong> {account.role}</p>
                  <p><strong>Email:</strong> {account.email}</p>
                  <p><strong>Password:</strong> {account.password}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleUseDemo(account.email, account.password)}
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
