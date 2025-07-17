"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/study-assistant/file-upload"
import { ChatInterface } from "@/components/study-assistant/chat-interface"
import StudyModeSelector from "@/components/study-assistant/study-mode-selector"
import { AIUsageBanner } from "@/components/study-assistant/ai-usage-banner"
import { SessionHistory } from "@/components/study-assistant/session-history"
import PracticeExamsList from "@/components/study-assistant/practice-exams-list"
import { AIFeaturesBanner } from "@/components/study-assistant/ai-features-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, ArrowLeft, TrendingUp, BookOpen, Sparkles, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [studyMode, setStudyMode] = useState<StudyMode>("chat")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [materialIds, setMaterialIds] = useState<string[]>([])
  const [studyStats, setStudyStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalMaterials: 0,
  })
  const [canUseAI, setCanUseAI] = useState(true)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [practiceExams, setPracticeExams] = useState<any[]>([])
  const [isGeneratingExam, setIsGeneratingExam] = useState(false)
  const router = useRouter()

  const mapSession = (hs: HistoryChatSession): ChatSession => ({
    ...hs,
    materials: hs.materials.map((m) => ({
      id: m.id,
      title: m.name,
      fileName: m.name,
      fileType: m.type,
      processingStatus: "completed",
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
        setPracticeExams(Array.isArray(data.exams) ? data.exams : [])
      } else {
        console.error("Failed to fetch practice exams:", response.status)
        setPracticeExams([])
      }
    } catch (error) {
      console.error("Error fetching practice exams:", error)
      setPracticeExams([])
    }
  }

  // FileUpload now sends only the array of files, so we no longer
  // receive a separate `ids` array or need the function to be `async`.
  const handleFilesUpdated = (files: UploadedFile[]) => {
    // save the files we got back from FileUpload
    setUploadedFiles(files)

    // derive the ID list directly from the files we just stored
    setMaterialIds(files.map((f) => f.id))

    toast.success("Files uploaded successfully! Processing in background...")

    // Check for completed files immediately and then periodically
    const checkForCompletedFiles = () => {
      const completedFiles = files.filter((f) => f.processingStatus === "completed")
      if (completedFiles.length > 0) {
        void generatePracticeExamFromMaterials(completedFiles)
        return true // Stop checking
      }
      return false // Continue checking
    }

    // Start checking after 3 seconds, then every 2 seconds for up to 30 seconds
    let attempts = 0
    const maxAttempts = 15
    const checkInterval = setInterval(() => {
      attempts++
      if (checkForCompletedFiles() || attempts >= maxAttempts) {
        clearInterval(checkInterval)
      }
    }, 2000)

    // Initial check after 3 seconds
    setTimeout(() => {
      if (checkForCompletedFiles()) {
        clearInterval(checkInterval)
      }
    }, 3000)

    // refresh study‑statistics in the background
    void fetchStudyStats()
  }


  const generatePracticeExamFromMaterials = async (files: UploadedFile[]) => {
    if (isGeneratingExam) return

    setIsGeneratingExam(true)
    try {
      console.log("🔄 Starting exam generation for files:", files.map(f => f.id))

      const response = await fetch("/api/ai/practice-exam/generate-from-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialIds: files.map((f) => f.id),
          sessionId: currentSession?._id || undefined,
        }),
      })

      const data = await response.json()
      console.log("📝 API Response:", data)

      if (response.ok) {
        toast.success("Practice exam generated automatically!")
        fetchPracticeExams()
        setActiveTab("exams")
      } else {
        console.error("❌ API Error:", data)
        toast.error(data.error || "Failed to generate practice exam")
      }
    } catch (error) {
      console.error("💥 Network Error:", error)
      toast.error("Network error during exam generation")
    } finally {
      setIsGeneratingExam(false)
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
    return uploadedFiles.filter((file) => file.processingStatus === "completed")
  }

  const getProcessedMaterialIds = () => {
    return uploadedFiles.filter((file) => file.processingStatus === "completed").map((file) => file.id)
  }

  useEffect(() => {
    const completed = uploadedFiles.filter(f => f.processingStatus === "completed")
    console.log(`📁 Files status check:`, {
      total: uploadedFiles.length,
      completed: completed.length,
      isGeneratingExam,
      completedIds: completed.map(f => f.id)
    })

    if (completed.length && !isGeneratingExam) {
      console.log(`🚀 Triggering auto exam generation for ${completed.length} files`)
      void generatePracticeExamFromMaterials(completed)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* AI Features Banner */}
      <AIFeaturesBanner />

      <div className="container max-w-7xl mx-auto py-4 lg:py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Alex AI Study Assistant
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Upload your materials and get AI-powered study help • Operation Save My CGPA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Usage Banner */}
        <AIUsageBanner onUsageUpdate={handleUsageUpdate} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Study Sessions</p>
                  <p className="text-2xl font-bold text-green-800">{studyStats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">AI Messages</p>
                  <p className="text-2xl font-bold text-blue-800">{studyStats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Materials</p>
                  <p className="text-2xl font-bold text-purple-800">{studyStats.totalMaterials}</p>
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
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Upload Materials
                </CardTitle>
                <CardDescription>Upload your course notes, PDFs, or images for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFilesUpdated={handleFilesUpdated} />
              </CardContent>
            </Card>

            {/* Study Mode Selector */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Study Mode
                </CardTitle>
                <CardDescription>Choose how you want Alex AI to help you study</CardDescription>
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
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-[calc(100vh-300px)] lg:h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <span>Alex AI Study Assistant</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        ({studyMode.charAt(0).toUpperCase() + studyMode.slice(1)} Mode)
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {studyMode === "questions" && "Generate practice questions from your materials"}
                      {studyMode === "summary" && "Get summaries and key points from your notes"}
                      {studyMode === "explain" && "Ask for explanations and clarifications"}
                      {studyMode === "chat" && "Chat freely with Alex AI about any academic topic"}
                      {getProcessedFiles().length > 0 && (
                        <span className="text-green-600 ml-2 font-medium">
                          • {getProcessedFiles().length} material{getProcessedFiles().length > 1 ? "s" : ""} ready
                        </span>
                      )}
                      {isGeneratingExam && (
                        <span className="text-blue-600 ml-2 font-medium animate-pulse">
                          • Generating practice exam...
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
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat with Alex
                      </TabsTrigger>
                      <TabsTrigger value="exams" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Practice Exams
                        {practiceExams.length > 0 && (
                          <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
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
                        materialIds={getProcessedMaterialIds()}
                        uploadedFiles={getProcessedFiles()}
                        canUseAI={canUseAI}
                        currentSession={currentSession}
                        onSessionUpdate={fetchStudyStats}
                        onPracticeExamGenerated={handlePracticeExamGenerated}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="exams" className="flex-1 p-0 m-0 min-h-0">
                    <div className="h-full p-6 overflow-y-auto">
                      <PracticeExamsList
                        exams={practiceExams}
                        isGenerating={isGeneratingExam}
                        onRefresh={fetchPracticeExams}
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