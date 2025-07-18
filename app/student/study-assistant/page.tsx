"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/study-assistant/chat-interface"
import StudyModeSelector from "@/components/study-assistant/study-mode-selector"
import { AIUsageBanner } from "@/components/study-assistant/ai-usage-banner"
import { SessionHistory } from "@/components/study-assistant/session-history"
import { PracticeExamsList } from "@/components/study-assistant/practice-exams-list"
import { AIFeaturesBanner } from "@/components/study-assistant/ai-features-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, BookOpen, MessageCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { HistoryChatSession } from "@/components/study-assistant/session-history"

export type StudyMode = "questions" | "summary" | "explain" | "chat"

interface UploadedFile {
  id: string
  title: string
  fileName: string
  fileType: string
  processingStatus: "pending" | "processing" | "completed" | "failed"
  uploadProgress: number
  extractedText?: string
}

interface ChatSession {
  id: string
  title: string
  studyMode: StudyMode
  materials: UploadedFile[]
  messageCount: number
  lastActivity: string
  createdAt: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
}

export default function StudyAssistant() {
  const [studyMode, setStudyMode] = useState<StudyMode>("chat")
  const [studyStats, setStudyStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalMaterials: 0,
  })
  const [canUseAI, setCanUseAI] = useState(true)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [practiceExams, setPracticeExams] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [showPostUploadPrompt, setShowPostUploadPrompt] = useState(false)
  // State to trigger explain prompt in ChatInterface
  const [showExplainPrompt, setShowExplainPrompt] = useState(false)
  const handleExplainPromptDismiss = () => setShowExplainPrompt(false)

  const mapSession = (hs: HistoryChatSession): ChatSession => ({
    ...hs,
    materials: hs.materials.map((m) => ({
      id: m.id,
      title: m.name,
      fileName: m.name,
      fileType: m.type,
      processingStatus: "completed" as const,
      uploadProgress: 100,
    })),
    studyMode: hs.studyMode as StudyMode,
  })

  useEffect(() => {
    fetchStudyStats()
    fetchPracticeExams()
  }, [])

  const fetchStudyStats = async () => {
    try {
      const response = await fetch("/api/study-analytics/summary")
      if (response.ok) {
        const data = await response.json()
        setStudyStats(data)
      }
    } catch (error) {
      console.error("Error fetching study stats:", error)
    }
  }

  const fetchPracticeExams = async () => {
    try {
      const response = await fetch("/api/ai/practice-exam")
      if (response.ok) {
        const data = await response.json()
        setPracticeExams(data.exams || [])
      }
    } catch (error) {
      console.error("Error fetching practice exams:", error)
    }
  }

  // Handler for when user chooses a mode or proceeds with chat
  const handlePostUploadAction = (mode: StudyMode | null) => {
    setShowPostUploadPrompt(false)
    if (mode) {
      // If user chooses 'chat' after upload, auto-switch to 'explain' and show a system message
      if (mode === 'chat') {
        setStudyMode('explain')
        setActiveTab('chat')
        setTimeout(() => {
          setShowExplainPrompt(true)
        }, 100) // Let ChatInterface mount first
      } else {
        setStudyMode(mode)
        setActiveTab('chat')
      }
    }
  }


  const handleContinueSession = (session: HistoryChatSession) => {
    const s = mapSession(session)
    setCurrentSession(s)
    setStudyMode(s.studyMode)
    setActiveTab("chat")
    toast.success(`Continuing session: ${s.title}`)
  }

  const handleUsageUpdate = (canUse: boolean) => {
    setCanUseAI(canUse)
  }

  const handlePracticeExamGenerated = () => {
    fetchPracticeExams()
    setActiveTab("exams")
  }

  const getProcessedFiles = () => {
    return [] // No materialIds to process
  }

  useEffect(() => {
    // Remove all references to materialIds and completed
    // In the UI, remove any display of material status/count in the main page
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* AI Features Banner */}
      <AIFeaturesBanner />

      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">AI Study Assistant</h1>
          <p className="text-gray-600 dark:text-gray-200 text-sm sm:text-base">
            Upload your study materials and let AI help you learn more effectively
          </p>
        </div>

        {/* AI Usage Banner */}
        <AIUsageBanner onUsageUpdate={handleUsageUpdate} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 dark:border-green-700">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white dark:text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-200">Study Sessions</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-100">{studyStats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white dark:text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-200">AI Messages</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{studyStats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 dark:border-purple-700 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white dark:text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-200">Materials</p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">{studyStats.totalMaterials}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            {/* Removed FileUpload component */}

            {/* Study Mode Selector */}
            <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-blue-300">
                  <Brain className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                  Study Mode
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-200">Choose how you want Alex AI to help you study</CardDescription>
              </CardHeader>
              <CardContent>
                <StudyModeSelector
                  selectedMode={studyMode}
                  onModeChange={setStudyMode}
                  disabled={studyMode !== "chat" && getProcessedFiles().length === 0}
                />
              </CardContent>
            </Card>

            {/* Session History */}
            <SessionHistory onContinueSession={handleContinueSession} />
          </div>

          {/* Right Column - Main Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm h-[calc(100vh-300px)] lg:h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-700 dark:to-green-700 rounded-lg">
                        <Brain className="h-5 w-5 text-white dark:text-white" />
                      </div>
                      <span>Alex AI Study Assistant</span>
                      <span className="text-sm font-normal text-muted-foreground dark:text-gray-300">
                        ({studyMode.charAt(0).toUpperCase() + studyMode.slice(1)} Mode)
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-700 dark:text-gray-200">
                      {studyMode === "questions" && "Generate practice questions from your materials"}
                      {studyMode === "summary" && "Get summaries and key points from your notes"}
                      {studyMode === "explain" && "Ask for explanations and clarifications"}
                      {studyMode === "chat" && "Chat freely with Alex AI about any academic topic"}
                      {getProcessedFiles().length > 0 && (
                        <span className="text-green-600 dark:text-green-300 ml-2 font-medium">
                          • {getProcessedFiles().length} material{getProcessedFiles().length > 1 ? "s" : ""} ready
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 flex flex-col min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="px-6 pt-4 border-b flex-shrink-0">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chat" className="flex items-center gap-2 text-gray-900 dark:text-white data-[state=active]:font-bold">
                        <MessageCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                        Chat with Alex
                      </TabsTrigger>
                      <TabsTrigger value="exams" className="flex items-center gap-2 text-gray-900 dark:text-white data-[state=active]:font-bold">
                        <BookOpen className="h-4 w-4 text-gray-900 dark:text-white" />
                        Practice Exams
                        {practiceExams.length > 0 && (
                          <span className="ml-1 bg-green-500 dark:bg-green-700 text-white text-xs rounded-full px-2 py-0.5">
                            {practiceExams.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chat" className="flex-1 p-0 m-0 min-h-0">
                    <div className="h-full">
                      <ChatInterface
                        studyMode={studyMode}
                        materialIds={getProcessedFiles()}
                        uploadedFiles={getProcessedFiles()}
                        canUseAI={canUseAI}
                        currentSession={currentSession}
                        onSessionUpdate={fetchStudyStats}
                        onPracticeExamGenerated={handlePracticeExamGenerated}
                        showPostUploadPrompt={showPostUploadPrompt}
                        onPostUploadAction={handlePostUploadAction}
                        showExplainPrompt={showExplainPrompt}
                        onExplainPromptDismiss={handleExplainPromptDismiss}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="exams" className="flex-1 p-0 m-0 min-h-0">
                    <div className="h-full p-6 overflow-y-auto">
                      <PracticeExamsList
                        exams={practiceExams}
                        onRefresh={fetchPracticeExams}
                        isGenerating={false}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}