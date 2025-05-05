"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from 'lucide-react';
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  // Handle authentication and authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard/login");
    } else if (
      session &&
      !["super-admin", "Admin", "Sub-Admin"].includes(session.user?.role as string)
    ) {
      router.push("/not-authorized");
    }
  }, [session, status, router]);

  // Animated progress for loading state
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(prevProgress + diff, 100);
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [status, progress]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background">
        <div className="w-full max-w-md px-8 space-y-6">
          {/* Logo or brand placeholder */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center">Admin Dashboard</h2>
          <p className="text-center text-muted-foreground mb-4">Loading your admin panel...</p>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-1 w-full" />
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-full bg-muted animate-pulse rounded mt-2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-4/6 bg-muted animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized state
  if (session && !["super-admin", "Admin", "Sub-Admin"].includes(session.user?.role as string)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You don&apos;t have permission to access this area.</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Main layout with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset className="p-2 ml-10 w-full">
          {children}
        </SidebarInset>
    </SidebarProvider>
  );
}