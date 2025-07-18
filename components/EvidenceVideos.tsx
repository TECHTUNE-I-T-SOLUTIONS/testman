// src/components/EvidenceVideos.tsx

import type { FC } from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

// Theme-aware hook (same as in support/faq/contact)
function useThemeAwareStyles() {
  const { theme } = useTheme(); // Call useTheme unconditionally
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return { theme, mounted };
}

type VideoCardProps = {
  title: string;
  videoUrl: string; // URL of the video or gif
};

const VideoCard: React.FC<VideoCardProps> = ({ title, videoUrl }) => (
  <div className="bg-white dark:bg-[#23232a] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow border border-gray-100 dark:border-[#23232a]">
    <h3 className="text-xl text-center font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
    <div className="flex justify-center items-center">
      <Image
        src={videoUrl}
        alt={title}
        width={500}
        height={300}
        className="w-full h-auto rounded-2xl transition-transform transform hover:scale-105"
        unoptimized // Necessary for .gif files
      />
    </div>
  </div>
);

const EvidenceVideos: FC = () => {
  const { mounted } = useThemeAwareStyles();

  // Wait for mount to avoid hydration mismatch
  if (!mounted) return null;

  // You can replace the URLs below with actual paths to the gifs/videos
  const videos = [
    {
      title: 'Registering on our platform',
      videoUrl: './assets/videos/register.gif', // Path to the video/gif
    },
    {
      title: 'Secure Sign-in',
      videoUrl: './assets/videos/login.gif', // Path to the video/gif
    },
    {
      title: 'Your Dashboard',
      videoUrl: './assets/videos/dashboard.gif', // Path to the video/gif
    },
    {
      title: 'Take Exams',
      videoUrl: './assets/videos/exam.gif', // Path to the video/gif
    },
    {
      title: 'View Exam Results',
      videoUrl: './assets/videos/results.gif', // Path to the video/gif
    },
    {
      title: 'Download Course Notes',
      videoUrl: './assets/videos/notes.gif', // Path to the video/gif
    },
    {
      title: 'View your Profile',
      videoUrl: './assets/videos/profile.gif', // Path to the video/gif
    },
    {
      title: 'Secure Log-out',
      videoUrl: './assets/videos/logout.gif', // Path to the video/gif
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-2 gap-6 mt-4">
      {videos.map((video, index) => (
        <VideoCard key={index} title={video.title} videoUrl={video.videoUrl} />
      ))}
    </div>
  );
};

export default EvidenceVideos;
