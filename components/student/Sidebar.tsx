"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutStudent } from "@/utils/auth";
import { FiHome, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { AiFillProfile, AiFillQuestionCircle } from "react-icons/ai";
import { LuFileOutput } from "react-icons/lu";

type SidebarProps = {
  onToggle: (isOpen: boolean) => void;
};

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/student", icon: <FiHome /> },
    {
      label: "Take Exams",
      path: "/student/exams",
      icon: <AiFillQuestionCircle />,
    },
    { label: "Results", path: "/student/results", icon: <LuFileOutput /> },
    { label: "Profile", path: "/student/profile", icon: <AiFillProfile /> },
  ];

  const toggleSidebar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle(newIsOpen);
  };

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await logoutStudent();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`h-screen ${isOpen ? "w-64" : "w-20"} bg-purple-700 text-white flex flex-col shadow-lg fixed transition-all duration-300`}
    >
      <div className="p-6 flex items-center space-y-10 justify-between">
        <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>
          Student Dashboard
        </h2>
        <button onClick={toggleSidebar} className="text-2xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`w-full text-left py-2 px-4 rounded-lg flex items-center space-x-2 ${
                  pathname === item.path
                    ? "bg-purple-800"
                    : "hover:bg-purple-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`${isOpen ? "block" : "hidden"}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogOut}
          disabled={isLoggingOut}
          className={`w-full bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg text-center flex items-center justify-center space-x-2 ${
            isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiLogOut className="text-xl" />
          <span className={`${isOpen ? "block" : "hidden"}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
