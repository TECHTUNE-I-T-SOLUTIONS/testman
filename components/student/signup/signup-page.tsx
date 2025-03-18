import { Card } from "@/components/ui/card";
import React from "react";

const SignupPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
      {children}
      </Card>
    </main>
  );
};

export default SignupPage;
