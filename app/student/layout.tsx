"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import AppSidebar from "@/components/student/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { logoutStudent } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

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
        className="border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors h-8 w-8"
      >
        <LogOut className="h-4 w-4" />
      </Button>

      {/* Mobile Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 z-20">
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
    </>
  )
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showSidebar =
    pathname.startsWith("/student") && !(pathname.startsWith("/student/exams/") && pathname.includes("/take"))

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          {/* Fixed Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white/95 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Student Portal</span>
              </div>
              {/* Mobile Logout Button */}
              <MobileLogoutButton />
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8 max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
