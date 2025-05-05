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

// this section is for showing ads
//   useEffect(() => {
//   const checkAdsStatus = async () => {
//     const res = await fetch("/api/ads");
//     const data = await res.json();
//     if (data.status === "on") {
//       // Show ads
//     }
//   };
//   checkAdsStatus();
// }, []);


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 pt-4 ml-8 md:pt-0 w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
