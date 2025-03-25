import { buttonVariants } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const SignupPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        {children}
        <CardFooter className="w-full flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className={cn(
                "inline !p-0 !m-0",
                buttonVariants({ variant: "link" })
              )}
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SignupPage;
