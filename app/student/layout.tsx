"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/student/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showSidebar = pathname.startsWith("/student");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 pt-16 md:pt-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
