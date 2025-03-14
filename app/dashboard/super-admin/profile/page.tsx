"use client";

import { useSession } from "next-auth/react";
import ProfileForm from "@/components/dashboard/profile/PasswordForm";
import PasswordForm from "@/components/dashboard/profile/ProfileForm";
import Header from "@/components/dashboard/Header";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-6">
        <Header title="Admin Profile" />
        <ProfileForm />
        <hr className="my-6" />
        <PasswordForm />
      </div>
    </div>
  );
}
