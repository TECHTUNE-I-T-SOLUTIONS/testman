"use client"

import { useEffect, useState } from "react"
import { Flame, AlertTriangle, X } from "lucide-react"
import Leaderboard from "@/components/student/Leaderboard"
import Announcements from "@/components/shared/Announcements"

export default function Dashboard() {
  const [showModal, setShowModal] = useState(true)
  const streakDays = 3

  useEffect(() => {
    // Auto-close modal after 15s
    const timer = setTimeout(() => setShowModal(false), 15000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
      {/* Information Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border-0 relative animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="p-6">
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">Update Your Faculty Details</h2>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-3">
                    Students in <strong>General Studies</strong>, <strong>Social Science</strong>,
                    <strong> Veterinary Medicine</strong>, and <strong>Physical Sciences</strong> are advised to update
                    their faculty and department to valid ones.
                  </p>
                  <p className="text-sm text-red-600 font-medium dark:text-red-500">
                    These faculties will soon be removed from the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Announcements */}
        <Announcements />

        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-100">Student Dashboard</h1>
            <p className="text-lg text-slate-600 dark:text-gray-400">Track your progress and academic performance</p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <Flame className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">{streakDays} day learning streak!</span>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="max-w-4xl mx-auto">
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}