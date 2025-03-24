"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/student/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const showSidebar = pathname.startsWith("/student");

  return (
    <SidebarProvider>
      {showSidebar && <AppSidebar />}
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
  );
}
