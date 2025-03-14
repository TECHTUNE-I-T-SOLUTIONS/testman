"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "An unknown error occurred.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
        <h1 className="text-3xl font-extrabold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-lg text-red-300 mb-6">{error}</p>
        <a
          href="/dashboard/login"
          className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition duration-300"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
