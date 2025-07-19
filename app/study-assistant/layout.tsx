"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/study-assistant/Sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StudyAssistantProvider, useStudyAssistant } from "@/contexts/StudyAssistantContext"

interface StudyAssistantLayoutProps {
  children: React.ReactNode
}

function StudyAssistantLayoutContent({ children }: StudyAssistantLayoutProps) {
  const router = useRouter()
  const { studyMode, handleContinueSession, handleNewChat, handleModeChange } = useStudyAssistant()

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        onContinueSession={handleContinueSession}
        onNewChat={handleNewChat}
        studyMode={studyMode}
        onModeChange={handleModeChange}
      />
      <SidebarInset className="flex flex-col h-screen bg-background">
        {/* Header for main content area */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-background/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button (SidebarTrigger) */}
            <SidebarTrigger className="lg:hidden" />
            
            {/* Alex AI Branding with Beta Badge */}
            <div className="hidden md:flex items-center gap-2">
              <img src="/alex.png" alt="Alex AI Logo" className="h-6 w-6 rounded-full" />
              <span className="font-semibold text-blue-700 dark:text-blue-200">Alex AI</span>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                in beta
              </span>
            </div>
            
            <Button
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              onClick={() => router.push("/student/exams")}
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Button>
          </div>
          <ThemeToggle />
        </header>

        {/* Main content area - render the page content with top padding for fixed header */}
        <main className="flex-1 flex flex-col min-h-0 bg-background pt-16">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function StudyAssistantLayout({ children }: StudyAssistantLayoutProps) {
  return (
    <StudyAssistantProvider>
      <StudyAssistantLayoutContent>{children}</StudyAssistantLayoutContent>
    </StudyAssistantProvider>
  )
}
