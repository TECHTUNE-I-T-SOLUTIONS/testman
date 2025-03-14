"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FiHome,
  FiUsers,
  FiTag,
  FiCpu,
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiBook,
  FiClipboard,
  FiLayers,
  FiCalendar,
  FiList,
} from "react-icons/fi";
import { FaCircleQuestion } from "react-icons/fa6";
import { BsFillExclamationSquareFill } from "react-icons/bs";
import { AiFillQuestionCircle } from "react-icons/ai";

type SidebarProps = {
  onToggle: (isOpen: boolean) => void;
};

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); 
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/dashboard/super-admin", icon: <FiHome /> },
    {
      label: "Manage Academics",
      icon: <FiUsers />,
      subItems: [
        {
          label: "Session",
          path: "/dashboard/super-admin/manage-academics/session",
          icon: <FiCalendar />,
        },
        {
          label: "Faculty",
          path: "/dashboard/super-admin/manage-academics/faculties",
          icon: <FiBook />,
        },
        {
          label: "Departments",
          path: "/dashboard/super-admin/manage-academics/departments",
          icon: <FiClipboard />,
        },
        {
          label: "Levels",
          path: "/dashboard/super-admin/manage-academics/levels",
          icon: <FiLayers />,
        },
        {
          label: "Courses",
          path: "/dashboard/super-admin/manage-academics/courses",
          icon: <FiCpu />,
        },
      ],
    },
    {
      label: "Manage Questions",
      icon: <FaCircleQuestion />,
      subItems: [
        {
          label: "Create Questions",
          path: "/dashboard/super-admin/manage-questions/questions",
          icon: <AiFillQuestionCircle />,
        },
        {
          label: "Create Exams",
          path: "/dashboard/super-admin/manage-questions/exams",
          icon: <BsFillExclamationSquareFill />,
        },
        {
          label: "Manage Results",
          path: "/dashboard/super-admin/manage-questions/results",
          icon: <FiList />,
        },
      ],
    },
    {
      label: "Manage Admins",
      path: "/dashboard/super-admin/manage-admins",
      icon: <FiTag />,
    },
    {
      label: "Manage Students",
      path: "/dashboard/super-admin/manage-students",
      icon: <FiCpu />,
    },
    {
      label: "Profile",
      path: "/dashboard/super-admin/profile",
      icon: <FiSettings />,
    },
  ];

  const toggleSidebar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle(newIsOpen);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/dashboard/login" });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`h-screen ${isOpen ? "w-64" : "w-20"} bg-purple-700 space-y-10 text-white flex flex-col shadow-lg fixed transition-all duration-300`}
    >
      <div className="p-6 flex items-center justify-between">
        <h2 className={`text-xl font-bold ${isOpen ? "block" : "hidden"}`}>
          Admin Dashboard
        </h2>
        <button onClick={toggleSidebar} className="text-2xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-6">
          {navItems.map((item, index) => (
            <li key={index}>
              {!item.subItems ? (
                <button
                  onClick={() => router.push(item.path!)}
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
              ) : (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full text-left py-2 px-4 rounded-lg flex items-center space-x-2 ${
                      openDropdown === item.label
                        ? "bg-purple-800"
                        : "hover:bg-purple-600"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`${isOpen ? "block" : "hidden"}`}>
                      {item.label}
                    </span>
                  </button>

                  {openDropdown === item.label && (
                    <ul className="ml-6 mt-2 space-y-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <button
                            onClick={() => router.push(subItem.path)}
                            className={`w-full text-left py-2 px-4 rounded-lg flex items-center space-x-2 ${
                              pathname === subItem.path
                                ? "bg-purple-800"
                                : "hover:bg-purple-600"
                            }`}
                          >
                            <span className="text-lg">{subItem.icon}</span>
                            <span className={`${isOpen ? "block" : "hidden"}`}>
                              {subItem.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
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
          {isLoggingOut && <span className="ml-2 loader"></span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
