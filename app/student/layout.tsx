"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import AppSidebar from "@/components/student/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { getStudentFromToken, logoutStudent } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { WebPushManager } from "@/components/web-push-manager"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useTheme } from "@/contexts/ThemeContext"

function MobileLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()
  const { isMobile } = useSidebar()

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

  if (!isMobile) return null

  return (
    <>
      <Button
        onClick={() => setShowLogoutConfirm(true)}
        disabled={isLoggingOut}
        variant="outline"
        size="icon"
        className="border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors h-8 w-8 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:border-red-400"
      >
        <LogOut className="h-4 w-4" />
      </Button>

      {/* Mobile Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 z-[101]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign Out</h2>
              <p className="text-gray-600 dark:text-gray-300">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogOut}
                disabled={isLoggingOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
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
    </>
  )
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [studentName, setStudentName] = useState<string | null>(null)
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute avatarSrc based on theme and mounted
  const avatarSrc = mounted
    ? theme === "dark"
      ? "/darkplaceholder-avatar.jpg"
      : "/placeholder-avatar.jpg"
    : "/placeholder-avatar.jpg";

  // Fetch student data for the header avatar
  const fetchStudentName = async () => {
    try {
      const tokenStudent = await getStudentFromToken()
      if (tokenStudent?.matricNumber) {
        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber)
        const res = await fetch(`/api/students/${encodedMatric}`)
        const data = await res.json()
        if (res.ok) {
          setStudentName(data.name)
        }
      }
    } catch (error) {
      console.error("Error fetching student name for header:", error)
    }
  }

  // Fetch student name on component mount
  useEffect(() => {
    fetchStudentName()
  }, [])

  const showSidebar =
    pathname.startsWith("/student") && !(pathname.startsWith("/student/exams/") && pathname.includes("/take"))

  // Logout handler shared by both modals
  const handleLogOut = async () => {
    setIsLoggingOut(true)
    try {
      await logoutStudent()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  // If on /student/study-assistant and on mobile, hide master sidebar and trigger
  if (pathname.startsWith('/student/study-assistant') && isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    )
  }

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          {/* Fixed Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 dark:bg-gray-700" />
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Student Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <WebPushManager />
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {mounted && (
                          <AvatarImage
                            key={theme}
                            src={avatarSrc}
                            alt="Student"
                          />
                        )}
                        <AvatarFallback className="bg-gray-900 dark:bg-gray-700 text-white font-semibold text-sm">
                          {studentName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "S"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 dark:bg-gray-900 dark:text-gray-100" align="end" forceMount>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/student/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" />
                        Profile
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer group"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400" />
                      <span className="text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Mobile Logout Button */}
                <MobileLogoutButton />
              </div>
            </div>
          </header>

          {/* Desktop Logout Confirmation Modal */}
          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogContent className="dark:bg-gray-900 dark:text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  Sign Out
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoggingOut} className="dark:bg-gray-800 dark:text-gray-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogOut}
                  disabled={isLoggingOut}
                  className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    "Sign Out"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8 max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}