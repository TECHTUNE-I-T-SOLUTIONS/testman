"use client";

import { useEffect, useState } from "react";
import { Flame, AlertTriangle } from "lucide-react";
import Leaderboard from "@/components/student/Leaderboard";
import Announcements from "@/components/shared/Announcements";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(true);
  const streakDays = 3;

  useEffect(() => {
    // Auto-close modal after 10s (optional)
    const timer = setTimeout(() => setShowModal(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 space-y-6 p-2 pt-0 md:p-8 relative">

      {/* ✅ Information Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-2xl border border-gray-200 animate-slide-up relative">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Update Your Faculty Details</h2>
                <p className="text-sm text-gray-600">
                  Students in <strong>General Studies</strong>, <strong>Social Science</strong>, <strong>Veterinary Medicine</strong>, and <strong>Physical Sciences</strong> are advised to update their faculty and department to valid ones.
                </p>
                <p className="text-sm text-red-500 mt-2">
                  These faculties will soon be removed from the platform.
                </p>
              </div>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ✅ Announcements Component */}
      <Announcements />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex justify-center text-3xl font-bold tracking-tight">
            Student Dashboard
          </h1>
          <p className="flex justify-center text-muted-foreground mt-1">
            Track your progress and upcoming tests
          </p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Flame className="mr-1 h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-500">{streakDays} day streak!</span>
        </div>
      </div>

      {/* Leaderboard Section */}
      <Leaderboard />
    </div>
  );
}
