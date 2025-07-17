"use client";

import { SessionProvider } from "next-auth/react";
import AdminSidebar from "@/components/dashboard/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}