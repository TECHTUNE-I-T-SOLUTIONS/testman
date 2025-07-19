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
          animation: scroll-left 20s linear infinite;
        }
        .scroll-text:hover {
          animation-play-state: paused;
        }
        /* Light mode styles */
        .announcement-bar {
          background: #fffbeb;
          border: 1px solid #fde68a;
        }
        .announcement-icon-bg {
          background: #fef3c7;
        }
        .announcement-title {
          color: #92400e;
        }
        .announcement-text {
          color: #b45309;
        }
        .announcement-dismiss {
          color: #b45309;
        }
        .announcement-dismiss:hover {
          color: #78350f;
          background: #fef3c7;
        }
        /* Dark mode overrides */
        :global(html.dark) .announcement-bar {
          background: #1f2937;
          border-color: #374151;
        }
        :global(html.dark) .announcement-icon-bg {
          background: #3b2f13;
        }
        :global(html.dark) .announcement-title {
          color: #fde68a;
        }
        :global(html.dark) .announcement-text {
          color: #fbbf24;
        }
        :global(html.dark) .announcement-dismiss {
          color: #fbbf24;
        }
        :global(html.dark) .announcement-dismiss:hover {
          color: #fde68a;
          background: #3b2f13;
        }
      `}</style>

      <div className="announcement-bar rounded-lg p-3 relative overflow-hidden transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 announcement-icon-bg rounded-full flex items-center justify-center transition-colors duration-300">
              <Volume2 className="h-4 w-4 announcement-text" />
            </div>
            {/* <span className="font-semibold announcement-title text-sm whitespace-nowrap transition-colors duration-300">
              Announcements:
            </span> */}
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="scroll-text whitespace-nowrap text-sm announcement-text font-medium transition-colors duration-300">
              {announcementText} • • • {announcementText}
            </div>
          </div>

          <button
            onClick={dismissAllAnnouncements}
            className="flex-shrink-0 announcement-dismiss transition-colors p-1 rounded"
            title="Dismiss all announcements"
            aria-label="Dismiss all announcements"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
