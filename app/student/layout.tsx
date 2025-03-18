"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/student/Sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/student";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {isDashboard && <Sidebar onToggle={setIsSidebarOpen} />}
      <main
        className={`transition-all duration-300 ${
          isDashboard && isSidebarOpen ? "ml-64" : "ml-0"
        } w-full min-h-screen bg-gray-50 p-6`}
      >
        {children}
      </main>
    </div>
  );
}