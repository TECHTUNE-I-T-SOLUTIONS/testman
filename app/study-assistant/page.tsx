"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/study-assistant/chat-interface"
import { PracticeExamsTab } from "@/components/study-assistant/practice-exams-tab"
import type { HistoryChatSession } from "@/components/study-assistant/Sidebar"
import { Button } from "@/components/ui/button"
import { MessageSquare, GraduationCap } from "lucide-react"
import { useStudyAssistant } from "@/contexts/StudyAssistantContext"

interface AIPracticeExam {
  id: string
  title: string
  subject: string
  questionsCount: number
  duration: number
  status: "draft" | "active" | "completed" | "expired"
  score?: number
  percentage?: number
  createdAt: string
  completedAt?: string
  startedAt?: string
}

export default function StudyAssistant() {
  const { studyMode, currentSession, canUseAI } = useStudyAssistant()
  const [activeTab, setActiveTab] = useState<"chat" | "exams">("chat")
  const [practiceExams, setPracticeExams] = useState<AIPracticeExam[]>([])
  const [examsLoading, setExamsLoading] = useState(false)

  const mapSessionToChatInterface = (session: HistoryChatSession | null) => {
    if (!session) return null
    return {
      ...session,
      materials: (session.materials || []).map((m) => ({
        id: m.id,
        title: m.name,
        fileName: m.name,
        fileType: m.type || "unknown",
        processingStatus: "completed" as const,
        extractedText: m.content || undefined,
      })),
    }
  }

  const fetchPracticeExams = async () => {
    setExamsLoading(true)
    try {
      const response = await fetch("/api/ai/practice-exam")
      if (response.ok) {
        const data = await response.json()
        setPracticeExams(data.exams || [])
      }
    } catch (error) {
      console.error("Failed to fetch practice exams:", error)
    } finally {
      setExamsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "exams") {
      fetchPracticeExams()
    }
  }, [activeTab])

  const handleExamDeleted = () => {
    fetchPracticeExams()
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-all duration-200 ${
                activeTab === "chat"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant={activeTab === "exams" ? "default" : "ghost"}
              onClick={() => setActiveTab("exams")}
              className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-all duration-200 ${
                activeTab === "exams"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Practice Exams
              {practiceExams.length > 0 && (
                <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full font-medium">
                  {practiceExams.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col h-full min-h-0 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-background">
        {activeTab === "chat" ? (
          <ChatInterface
            studyMode={studyMode}
            materialIds={[]}
            canUseAI={canUseAI}
            currentSession={mapSessionToChatInterface(currentSession)}
            onSessionUpdate={() => {}}
          />
        ) : (
          <PracticeExamsTab
            exams={practiceExams}
            loading={examsLoading}
            onExamDeleted={handleExamDeleted}
            onRefresh={fetchPracticeExams}
          />
        )}
      </div>
    </div>
  )
}
