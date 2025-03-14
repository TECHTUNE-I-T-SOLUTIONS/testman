"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading")
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-200 to-purple-500">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-purple-700"></div>
        <p className="text-white font-semibold mt-4 text-xl">Loading...</p>
      </div>
    );

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-bold text-gray-700">Access Denied</p>
      </div>
    );

  const formattedDate = new Date().toLocaleDateString();
  const adminEmail = session.user?.email ?? "N/A";
  const matricNumber = session.user?.matricNumber ?? "Not Available";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-purple-400 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-lg p-12 md:p-16 lg:p-20">
        <h1 className="text-5xl font-extrabold text-purple-800 mb-10 text-center animate-fade-in">
          Welcome to the Admin Dashboard
        </h1>
        <div className="bg-green-50 p-6 rounded-xl shadow-inner border-l-4 border-purple-500 mb-10">
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Hello,{" "}
            <span className="text-purple-700 font-bold">{adminEmail}</span>!
          </p>
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Matric Number:{" "}
            <span className="text-purple-700 font-bold">{matricNumber}</span>
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">Today:</span>{" "}
            <span className="text-purple-800 font-bold">{formattedDate}</span>
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Current Time:</span>{" "}
            <span className="text-purple-800 font-bold">{currentTime}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
