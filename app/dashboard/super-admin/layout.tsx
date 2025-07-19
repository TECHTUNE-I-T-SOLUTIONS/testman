"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Custom styles for better dark/light/system mode support
const loaderBg =
  "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30";
const cardPulseBg =
  "bg-muted/40 dark:bg-muted/60 border border-muted/30 dark:border-muted/40";
const textTitle =
  "text-2xl font-bold text-center text-foreground transition-colors";
const textMuted =
  "text-center text-muted-foreground mb-4 transition-colors";
const accessDeniedTitle =
  "text-2xl font-bold text-foreground transition-colors";
const accessDeniedDesc =
  "text-muted-foreground mt-2 transition-colors";
const btnHome =
  "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50";

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
      router.push("/auth/admin/login");
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
      <div className="flex flex-col justify-center items-center h-screen bg-background transition-colors duration-300">
        <div className="w-full max-w-md px-8 space-y-6">
          {/* Logo or brand placeholder */}
          <div className="flex justify-center mb-4">
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center ${loaderBg} transition-colors duration-300`}
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div
                className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
          </div>

          <h2 className={textTitle}>Admin Dashboard</h2>
          <p className={textMuted}>Loading your admin panel...</p>

          <div className="space-y-2">
            <Progress value={progress} className="h-1 w-full" />

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className={cardPulseBg + " transition-colors duration-300"}>
                  <CardContent className="p-4">
                    <div className="h-4 w-2/3 bg-muted dark:bg-muted/70 animate-pulse rounded transition-colors duration-300"></div>
                    <div className="h-8 w-full bg-muted dark:bg-muted/70 animate-pulse rounded mt-2 transition-colors duration-300"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className={cardPulseBg + " transition-colors duration-300"}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted dark:bg-muted/70 animate-pulse rounded transition-colors duration-300"></div>
                  <div className="h-4 w-5/6 bg-muted dark:bg-muted/70 animate-pulse rounded transition-colors duration-300"></div>
                  <div className="h-4 w-4/6 bg-muted dark:bg-muted/70 animate-pulse rounded transition-colors duration-300"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized state
  if (
    session &&
    !["super-admin", "Admin", "Sub-Admin"].includes(session.user?.role as string)
  ) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background transition-colors duration-300">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className={accessDeniedTitle}>Access Denied</h2>
        <p className={accessDeniedDesc}>
          You don&apos;t have permission to access this area.
        </p>
        <button
          onClick={() => router.push("/")}
          className={btnHome}
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Main layout with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      {/* 
        To ensure the sidebar trigger icon is visible in all modes,
        we add explicit color classes and transition for the trigger icon.
        If your AdminSidebar uses a trigger button, ensure it uses:
        "text-foreground hover:text-primary transition-colors"
        for the icon, or override as below if needed.
      */}
      <style jsx global>{`
        .sidebar-trigger-icon {
          color: var(--foreground);
          transition: color 0.2s;
        }
        html.dark .sidebar-trigger-icon {
          color: #f3f4f6 !important;
        }
        html:not(.dark) .sidebar-trigger-icon {
          color: #1e293b !important;
        }
      `}</style>{/* The triggerIconClassName prop is not directly supported by AdminSidebar. */}
      <AdminSidebar />
      <SidebarInset className="p-2 ml-10 w-full transition-colors duration-300">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}