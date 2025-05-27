"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

interface Announcement {
  _id: string;
  content: string;
  show: boolean;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        setAnnouncements(data); // Fixed here
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };

    fetchAnnouncements();
  }, []);

  const visibleAnnouncements = announcements.filter((a) => a.show);

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-md p-2 px-4 relative overflow-hidden">
      <div className="flex items-center space-x-2 mb-1 font-semibold">
        <Volume2 className="w-4 h-4" />
        <span>Announcements</span>
      </div>
      <div className="overflow-hidden w-full">
        <div className="whitespace-nowrap animate-scroll-text">
          {visibleAnnouncements.map((a) => (
            <span key={a._id} className="mr-10">
              {a.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
