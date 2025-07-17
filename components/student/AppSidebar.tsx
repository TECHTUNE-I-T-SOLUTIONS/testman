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
} from "@/components/ui/sidebar"
import {
  Home,
  BookOpenCheck,
  FileIcon as FileUser,
  NotebookPen,
  LogOut,
  User,
  Loader2,
  MessageCircle,
  Info,
  Phone,
  AlertTriangle,
  CheckCircle,
  X,
  Crown,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

interface Student {
  name: string
  matricNumber: string
  loggedIn: boolean
  isActive: boolean
  phoneNumber?: string
  faculty?: { name: string }
  department?: { name: string }
  level?: { name: string }
}

const AppSidebar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { state, setOpenMobile, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [showInactiveModal, setShowInactiveModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showSidebarHelpModal, setShowSidebarHelpModal] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch student data and manage modal visibility
  const fetchStudent = async () => {
    try {
      setLoading(true)
      const tokenStudent = await getStudentFromToken()
      if (!tokenStudent?.matricNumber) return router.push("/auth/login")
      const encodedMatric = encodeURIComponent(tokenStudent.matricNumber)
      const res = await fetch(`/api/students/${encodedMatric}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch student")
      const studentDetails: Student = {
        name: data.name,
        matricNumber: data.matricNumber,
        loggedIn: true,
        isActive: data.isActive?.toString().toLowerCase() === "true",
        phoneNumber: data.phoneNumber,
        faculty: data.faculty,
        department: data.department,
        level: data.level,
      }
      setStudent(studentDetails)
      // Show inactive modal if not active
      if (!studentDetails.isActive) setShowInactiveModal(true)
      // Show phone modal if phone number is missing and NOT on profile page
      if (!studentDetails.phoneNumber && pathname !== "/student/profile") {
        setShowPhoneModal(true)
      } else {
        setShowPhoneModal(false)
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-close mobile sidebar when modals are shown
  useEffect(() => {
    if ((showInactiveModal || showLogoutConfirm) && isMobile) {
      setOpenMobile(false)
    }
  }, [showInactiveModal, showLogoutConfirm, setOpenMobile, isMobile])

  // Poll every 5 minutes to refresh student data
  useEffect(() => {
    const interval = setInterval(fetchStudent, 300000) // 5 minutes
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navItems = [
    { label: "Dashboard", path: "/student", icon: Home },
    {
      label: "Take Exams",
      path: "/student/exams",
      icon: BookOpenCheck,
      requiresActive: true,
      hasNew: true,
    },
    {
      label: "Results",
      path: "/student/results",
      icon: FileUser,
      requiresActive: true,
    },
    {
      label: "Notes",
      path: "/student/notes",
      icon: NotebookPen,
      requiresActive: true,
    },
    { label: "Profile", path: "/student/profile", icon: User },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNavClick = (item: any) => {
    if (item.requiresActive && !student?.isActive) {
      setShowInactiveModal(true)
      return
    }
    if (isMobile) {
      setOpenMobile(false)
    }
    router.push(item.path)
  }

  const firstInitial = student?.name ? student.name.split(" ")[0][0].toUpperCase() : "S"

  if (loading) {
    return (
      <Sidebar className="border-r border-gray-200 bg-white">
        <SidebarContent className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  if (!student) return null

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <SidebarHeader className="border-b border-gray-100 dark:border-gray-700 p-6">
          {/* Centered Student Info */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with Online Status */}
            <div className="relative">
              <Avatar className={cn("border-2 border-gray-200", isCollapsed ? "h-10 w-10" : "h-16 w-16")}>
                <AvatarFallback className="bg-gray-900 text-white font-semibold text-xl">{firstInitial}</AvatarFallback>
              </Avatar>
              {student.loggedIn && (
                <div
                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-sm"
                  title="Online"
                />
              )}
            </div>

            {/* Student Details - Only show when not collapsed */}
            {!isCollapsed && (
              <div className="space-y-2 w-full">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">{student.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{student.matricNumber}</p>

                {/* Status Badge with Premium/Freemium Icon */}
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant={student.isActive ? "default" : "destructive"}
                    className={cn(
                      "text-xs px-3 py-1 font-medium flex items-center gap-1.5",
                      student.isActive
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
                    )}
                  >
                    {student.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </Badge>

                  {/* Premium/Freemium Icon with Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "p-1.5 rounded-full border-2 cursor-help transition-colors",
                          student.isActive
                            ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100",
                        )}
                      >
                        {student.isActive ? <Crown className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">{student.isActive ? "Premium Access" : "Freemium Access"}</p>
                      <p className="text-xs text-gray-600">
                        {student.isActive
                          ? "You have full access to all features including exams, results, and notes."
                          : "Limited access. Activate your account for full premium features."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          {/* Portal Title - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Student Portal</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Academic Management System</p>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="p-3">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.path
              const isDisabled = item.requiresActive && !student.isActive
              const IconComponent = item.icon
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={isCollapsed ? item.label : undefined}
                    className={cn(
                      "transition-all duration-200 h-12 mb-1 rounded-lg",
                      isActive && "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 shadow-sm",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      !isActive && !isDisabled && "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                    )}
                    onClick={() => handleNavClick(item)}
                  >
                    <IconComponent className="h-5 w-5" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.hasNew && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
                              New
                            </Badge>
                          )}
                        </div>
                        {isDisabled && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>

          {!isCollapsed && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-2">Need Help?</p>
                  <button
                    onClick={() => setShowSidebarHelpModal(true)}
                    className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 underline font-medium"
                  >
                    View navigation guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4 border-t border-gray-100 dark:border-gray-700">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between p-2">
                <ThemeToggle />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors",
              isCollapsed ? "w-10 h-10" : "w-full justify-start h-11",
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2 font-medium">Sign Out</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Help Modal */}
      {showSidebarHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Navigation Guide</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebarHelpModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.label === "Dashboard" && "View your academic overview and announcements"}
                        {item.label === "Take Exams" && "Access and complete available examinations"}
                        {item.label === "Results" && "View your exam scores and performance history"}
                        {item.label === "Notes" && "Access study materials and saved notes"}
                        {item.label === "Profile" && "Manage your personal and academic information"}
                      </p>
                      {item.requiresActive && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Requires Active Account
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Inactive Account Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Account Inactive</h2>
              <p className="text-gray-600 leading-relaxed">
                Your account is currently inactive. Contact the administrator to activate your account and access all
                features.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInactiveModal(false)}
                className="flex-1 border-gray-200 text-gray-700"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const adminPhone = "2348083191228"
                  const message = encodeURIComponent(
                    `Hello Admin,\n\n` +
                      `My name is ${student.name}. I need to activate my account on Operation Save my CGPA.\n\n` +
                      `Details:\n` +
                      `Matric Number: ${student.matricNumber}\n` +
                      `Phone: ${student.phoneNumber || "N/A"}\n` +
                      `Faculty: ${student.faculty?.name || "N/A"}\n` +
                      `Department: ${student.department?.name || "N/A"}\n` +
                      `Level: ${student.level?.name || "N/A"}\n\n` +
                      `Please help activate my account.\n\nThank you!`,
                  )
                  window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank")
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sign Out</h2>
              <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogOut}
                disabled={isLoggingOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Update Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <Phone className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Update Required</h2>
              <p className="text-gray-600">Please add your phone number to continue using the platform.</p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  router.push("/student/profile")
                  setShowPhoneModal(false)
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
              >
                Update Phone Number
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}

export default AppSidebar