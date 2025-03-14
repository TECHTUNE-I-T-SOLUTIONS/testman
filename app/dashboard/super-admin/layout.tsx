"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/dashboard/login");
  } else if (
    session &&
    !["super-admin", "Admin", "Sub-Admin"].includes(session.user.role)
  ) {
    router.push("/not-authorized");
  }
}, [session, status, router]);


  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-purple-600 text-lg font-semibold">Loading ...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar onToggle={setIsSidebarOpen} />
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } w-full min-h-screen bg-gray-50 p-6`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </main>
    </div>
  );
}
