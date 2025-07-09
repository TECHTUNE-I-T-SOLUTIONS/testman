"use client"

import { useEffect, useState } from "react"
import { Volume2, X } from "lucide-react"

interface Announcement {
  _id: string
  content: string
  show: boolean
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements")
        const data = await res.json()
        setAnnouncements(data)
      } catch (err) {
        console.error("Failed to fetch announcements", err)
      }
    }

    fetchAnnouncements()
  }, [])

  const visibleAnnouncements = announcements.filter((a) => a.show && !dismissed.includes(a._id))

  const dismissAllAnnouncements = () => {
    setDismissed(visibleAnnouncements.map((a) => a._id))
  }

  if (visibleAnnouncements.length === 0) return null

  // Create a continuous string of all announcements separated by a delimiter
  const announcementText = visibleAnnouncements.map((a) => a.content).join(" • • • ")

  return (
    <>
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .scroll-text {
          animation: scroll-left 30s linear infinite;
        }
        
        .scroll-text:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-semibold text-amber-900 text-sm whitespace-nowrap">Announcements:</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="scroll-text whitespace-nowrap text-sm text-amber-800 font-medium">
              {announcementText} • • • {announcementText}
            </div>
          </div>

          <button
            onClick={dismissAllAnnouncements}
            className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors p-1 hover:bg-amber-100 rounded"
            title="Dismiss all announcements"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
