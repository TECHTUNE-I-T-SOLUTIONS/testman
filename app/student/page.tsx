"use client";

import { Flame } from "lucide-react";
import Leaderboard from "@/components/student/Leaderboard";

export default function Dashboard() {
  const streakDays = 3;
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex justify-center text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="flex justify-center text-muted-foreground mt-1">Track your progress and upcoming tests</p>
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
