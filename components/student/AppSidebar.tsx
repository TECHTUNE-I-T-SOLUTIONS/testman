"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getStudentFromToken, logoutStudent } from "@/utils/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import Link from "next/link"
import {
  BookOpenCheck,
  NotebookPen,
  FileIcon as FileUser,
  HomeIcon as House,
  LogOut,
  User,
  Loader2,
  ChevronLeft,
  MessageCircle,
  ChevronRight,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const AppSidebar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [showInactiveModal, setShowInactiveModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // A custom trigger component that adapts to the sidebar state
  const CustomSidebarTrigger = () => {
    const { state, toggleSidebar } = useSidebar()

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 rounded-full absolute right-[-12px] top-4 bg-background border shadow-sm z-10 hidden md:flex"
      >
        {state === "collapsed" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }

  // Mobile trigger that's visible on small screens
  const MobileSidebarTrigger = () => {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpenMobile(true)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open Menu</span>
      </Button>
    )
  }

  const [student, setStudent] = useState<{
    name: string;
    matricNumber: string;
    loggedIn: boolean;
    isActive: boolean; // boolean not string
  } | null>(null)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const tokenStudent = await getStudentFromToken();
        if (!tokenStudent?.matricNumber) return router.push("/auth/login");

        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber);
        const res = await fetch(`/api/students/${encodedMatric}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch student");

        const studentDetails = {
          name: data.name,
          matricNumber: data.matricNumber,
          loggedIn: true,
          isActive: data.isActive?.toString().toLowerCase() === "true"
        };

        setStudent(studentDetails);

        if (!studentDetails.isActive) setShowInactiveModal(true);
      } catch (error) {
        console.error("Error fetching student:", error);
      }
    };

    fetchStudent();
  }, [router]);

  useEffect(() => {
    if ((showInactiveModal || showLogoutConfirm) && window.innerWidth < 768) {
      setOpenMobile(false)
    }
  }, [showInactiveModal, showLogoutConfirm, setOpenMobile])

  const navItems = [
    { label: "Home", path: "/student", icon: <House className="h-5 w-5" /> },
    {
      label: "Take Exams",
      path: "/student/exams",
      icon: <BookOpenCheck className="h-5 w-5" />,
      requiresActive: true,
    },
    {
      label: "Results",
      path: "/student/results",
      icon: <FileUser className="h-5 w-5" />,
      requiresActive: true,
    },
    {
      label: "Notes",
      path: "/student/notes",
      icon: <NotebookPen className="h-5 w-5" />,
      requiresActive: true,
    },
    { label: "Profile", path: "/student/profile", icon: <User className="h-5 w-5" /> },
  ]

  const handleLogOut = async () => {
    setIsLoggingOut(true)
    try {
      await logoutStudent()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const firstInitial = student?.name ? student.name.split(" ")[0][0] : "S"

  if (!student) {
    return null // or a loading spinner
  }

  return (
    <>
      <MobileSidebarTrigger />

      <Sidebar collapsible="icon" className="relative border-r">
        <CustomSidebarTrigger />

        <SidebarHeader className={cn("p-4 flex flex-col items-center relative", isCollapsed ? "pb-2" : "pb-4")}>
          <div className="w-full flex items-center justify-center mb-4">
            <div className="relative mb-4">
              <Avatar className={cn("border-2 border-primary/20", isCollapsed ? "h-8 w-8" : "h-16 w-16")}>
                <AvatarFallback className="bg-primary/10 text-primary">{firstInitial}</AvatarFallback>
              </Avatar>
              {student?.loggedIn && (
                <div
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                  title="Online status"
                />
              )}
            </div>
          </div>
          {!isCollapsed && (
            <>
              <h2 className="text-xl font-bold text-center">Student Portal</h2>
              <p className="text-sm text-muted-foreground mt-1">Welcome, {student?.name?.split(" ")[0]}</p>
            </>
          )}
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.path && (!item.requiresActive || student?.isActive);
              const isDisabled = item.requiresActive && !student?.isActive

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "transition-all duration-200",
                      isActive && "bg-primary/10 font-medium",
                      isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10"
                    )}
                  >
                    <div>
                      <Link
                        href={isDisabled ? "#" : item.path}
                        onClick={(e) => {
                          if (isDisabled) {
                            e.preventDefault();
                            setShowInactiveModal(true);
                          } else {
                            setOpenMobile(false); // Close sidebar on active link click
                          }
                        }}
                        className="flex items-center py-2"
                      >

                        <div
                          className={cn(
                            "text-muted-foreground",
                            isCollapsed ? "mx-auto" : "mr-3",
                            isActive && "text-primary"
                          )}
                        >
                          {item.icon}
                        </div>
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className={cn("p-4", isCollapsed && "flex flex-col items-center")}>
          {!isCollapsed && student && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <span>ID: {student.matricNumber}</span>
              <span
                className={cn(
                  "px-2 py-1 text-white rounded-md text-xs",
                  student.isActive ? "bg-green-600" : "bg-red-500"
                )}
              >
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          )}

          <Button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "border-muted-foreground/20 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-300",
              isCollapsed ? "w-8 h-8 p-0" : "w-full",
            )}
            title="Sign Out"
          >
            <>
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </>
          </Button>
        </SidebarFooter>

      </Sidebar>

      {showInactiveModal && (
        <div className="fixed inset-0 bg-black/50 z-[99] flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md text-center space-y-4">
            <h2 className="text-lg font-semibold text-red-600">Access Restricted</h2>
            <p className="text-muted-foreground">
              Your account is inactive. Please contact the admin for access to full resources.
            </p>

            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="default"
                onClick={() => {
                  const adminPhone = "2348083191228";
                  const message = encodeURIComponent(
                    `Hello Admin,\n\nMy name is ${student?.name?.split(" ")[0]}. I'm trying to access my account on Operation Save my CGPA, but it shows that my account is inactive.\n\nKindly help me restore access to the full resources.\n\nThank you!`
                  );
                  window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank");
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Admin
              </Button>

              <Button
                onClick={() => setShowInactiveModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}


      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[99] flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md text-center space-y-4">
            <h2 className="text-lg font-semibold">Confirm Logout</h2>
            <p className="text-muted-foreground">Are you sure you want to log out?</p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleLogOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  "Log Out"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppSidebar
