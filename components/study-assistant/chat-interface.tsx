"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Loader2, Sparkles, BookOpen, Download, Paperclip, Copy } from "lucide-react"
import { toast } from "sonner"
import type { StudyMode } from "@/app/student/study-assistant/page"
import { useTheme } from "@/contexts/ThemeContext"
import ReactMarkdown from "react-markdown"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    studyMode?: StudyMode
    materialIds?: string[]
    quickActions?: boolean
  }
}

interface UploadedFile {
  id: string
  title: string
  fileName: string
  fileType: string
  processingStatus: "pending" | "processing" | "completed" | "failed"
  extractedText?: string
}

interface ChatInterfaceProps {
  studyMode: StudyMode
  materialIds: string[]
  uploadedFiles: UploadedFile[]
  canUseAI: boolean
  currentSession: {
    id: string
    title: string
    studyMode: StudyMode
    materials: UploadedFile[]
    messageCount: number
    lastActivity: string
    createdAt: string
    messages: ChatMessage[]
  } | null
  onSessionUpdate: () => void
  onPracticeExamGenerated: () => void
  showPostUploadPrompt?: boolean
  onPostUploadAction?: (mode: StudyMode | null) => void
  showExplainPrompt?: boolean
  onExplainPromptDismiss?: () => void
}

export function ChatInterface({
  studyMode,
  materialIds,
  uploadedFiles,
  canUseAI,
  currentSession,
  onSessionUpdate,
  onPracticeExamGenerated,
  showPostUploadPrompt = false,
  onPostUploadAction,
  showExplainPrompt = false,
  onExplainPromptDismiss,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isGeneratingExam, setIsGeneratingExam] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [fileInputRef] = useState(() => React.createRef<HTMLInputElement>())
  const [fileMessages, setFileMessages] = useState<{ id: string; fileName: string; status: string; extractedText?: string }[]>([])
  const [extractedContent, setExtractedContent] = useState<string | null>(null)
  const scrollableDivRef = useRef<HTMLDivElement | null>(null)

  // Attach scroll event to the actual scrollable div
  const setScrollableDiv = useCallback((node: HTMLDivElement | null) => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.removeEventListener("scroll", handleScroll)
    }
    if (node) {
      node.addEventListener("scroll", handleScroll)
      scrollableDivRef.current = node
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollableDivRef.current) return
    // setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 50) // This line is removed as per the edit hint.
  }, [])

  // Update showScrollToBottom on new messages
  useEffect(() => {
    handleScroll()
  }, [messages, fileMessages, handleScroll])

  // Remove callback ref logic for scrollable div
  // Instead, use useEffect to find the scrollable element inside ScrollArea
  useEffect(() => {
    let scrollable: HTMLElement | null = null
    const handleScroll = () => {
      if (!scrollable) return
      // setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 50) // This line is removed as per the edit hint.
    }
    // Try to find the scrollable div inside ScrollArea
    if (scrollAreaRef.current) {
      // Find the first child with overflow-y-auto or overflow-y-scroll
      scrollable = scrollAreaRef.current.querySelector('[class*="overflow-y-auto"], [class*="overflow-y-scroll"]') as HTMLElement
      if (scrollable) {
        scrollable.addEventListener('scroll', handleScroll)
      }
    }
    // Clean up
    return () => {
      if (scrollable) {
        scrollable.removeEventListener('scroll', handleScroll)
      }
    }
  }, [messages, fileMessages])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages)
      setSessionId(currentSession.id)
    } else {
      setMessages([])
      setSessionId(null)
    }
  }, [currentSession])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  // Copy to clipboard handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  // Scroll to bottom handler
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Auto-scroll to bottom on new message
  useEffect(() => {
    // Use setTimeout to ensure DOM updates before scrolling
    setTimeout(() => {
      scrollToBottom()
    }, 50)
  }, [messages, fileMessages])

  // Show/hide scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollAreaRef.current) return
      // Show button if not at the bottom (allowing a 50px threshold)
      // setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 50) // This line is removed as per the edit hint.
    }
    const el = scrollAreaRef.current
    if (el) {
      el.addEventListener("scroll", handleScroll)
      return () => el.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !canUseAI) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      metadata: { studyMode, materialIds },
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    /* ----- SEND TO BACK‑END ----------------------------------- */
    try {
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conversationHistory: [...messages, userMessage],
          message: userMessage.content,           // the current question
          studyMode,
          materialIds,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: ChatMessage = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setSessionId(data.sessionId)
        onSessionUpdate()                       // refresh history panel
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to get response from AI.")
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-error",
            role: "assistant",
            content: `Error: ${errorData.error || "Could not get a response."}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Chat API error:", error)
      toast.error("An unexpected error occurred.")
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: "An unexpected error occurred. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
    /* ----------------------------------------------------------- */
  }

  const handleGenerateExamFromChat = async () => {
    if (messages.length === 0) {
      toast.error("No chat content to generate exam from")
      return
    }

    setIsGeneratingExam(true)
    try {
      // Get educational content from the chat
      const chatContent = messages
        .map((msg) => `${msg.role === "user" ? "Student" : "Alex AI"}: ${msg.content}`)
        .join("\n\n")

      // Fix: Use .id instead of ._id for sessionId
      console.log("📝 Generating exam from chat content:", {
        sessionId: currentSession?.id,
        contentLength: chatContent.length,
        messageCount: messages.length
      })

      const response = await fetch("/api/ai/practice-exam/generate-from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: chatContent,
          sessionId: currentSession?.id || undefined,
          studyMode: studyMode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Practice exam generated from chat!")
        onPracticeExamGenerated()
      } else {
        console.error("❌ Generate exam error:", data)
        toast.error(data.error || "Failed to generate exam from chat")
      }
    } catch (error) {
      console.error("💥 Error generating exam from chat:", error)
      toast.error("Failed to generate exam from chat")
    } finally {
      setIsGeneratingExam(false)
    }
  }

  const handleDownloadChat = async () => {
    if (!sessionId) {
      toast.error("No active chat session to download.")
      return
    }
    try {
      const response = await fetch(`/api/chat/download?sessionId=${sessionId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chat_session_${sessionId}.txt`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success("Chat downloaded successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to download chat.")
      }
    } catch (error) {
      console.error("Error downloading chat:", error)
      toast.error("Error downloading chat.")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Add a status bubble to chat
    const fileMsgId = Date.now().toString()
    setFileMessages((prev) => [...prev, { id: fileMsgId, fileName: file.name, status: "uploading" }])
    // Upload file
    const formData = new FormData()
    formData.append("file", file)
    try {
      const uploadRes = await fetch("/api/study-materials/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadData = await uploadRes.json()
      const materialId = uploadData.material.id
      // Update status to processing
      setFileMessages((prev) => prev.map(msg => msg.id === fileMsgId ? { ...msg, status: "processing" } : msg))
      // Poll for processing
      let attempts = 0
      const maxAttempts = 60
      const poll = async () => {
        if (attempts++ > maxAttempts) {
          setFileMessages((prev) => prev.map(msg => msg.id === fileMsgId ? { ...msg, status: "failed" } : msg))
          return
        }
        const statusRes = await fetch(`/api/study-materials/status?materialId=${materialId}`)
        const statusData = await statusRes.json()
        if (statusData.status === "completed") {
          setFileMessages((prev) => prev.map(msg => msg.id === fileMsgId ? { ...msg, status: "completed", extractedText: statusData.extractedTextPreview } : msg))
          setExtractedContent(statusData.extractedTextPreview)
          // AI sends a message with quick actions
          setMessages((prev) => [...prev, {
            id: Date.now().toString() + "-ai",
            role: "assistant",
            content: "I&apos;ve extracted your document. What would you like to do?",
            timestamp: new Date().toISOString(),
            metadata: { quickActions: true }
          }])
        } else if (statusData.status === "failed") {
          setFileMessages((prev) => prev.map(msg => msg.id === fileMsgId ? { ...msg, status: "failed" } : msg))
        } else {
          setTimeout(poll, 3000)
        }
      }
      poll()
    } catch {
      setFileMessages((prev) => prev.map(msg => msg.id === fileMsgId ? { ...msg, status: "failed" } : msg))
    }
  }

  // Handle quick action (Explain, Generate Questions, Summarise)
  const handleQuickAction = async (action: "explain" | "questions" | "summary") => {
    if (!extractedContent) return
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: action === "explain" ? "Explain this document" : action === "questions" ? "Generate questions from this document" : "Summarise this document",
      timestamp: new Date().toISOString(),
    }])
    setIsLoading(true)
    try {
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: action === "explain" ? "Explain this document" : action === "questions" ? "Generate questions from this document" : "Summarise this document",
          studyMode: action,
          materialIds: [], // Not needed, we use extractedContent
          extractedContent,
        })
      })
      const data = await response.json()
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const getChatTitle = () => {
    if (currentSession) {
      return currentSession.title
    }
    if (studyMode === "chat") return "New Chat Session"
    if (studyMode === "questions") return "Generate Questions"
    if (studyMode === "summary") return "Summarize Content"
    if (studyMode === "explain") return "Explain Concepts"
    return "Alex AI Assistant"
  }

  const getChatDescription = () => {
    if (currentSession) {
      return `Continuing session from ${new Date(currentSession.createdAt).toLocaleDateString()}`
    }
    if (studyMode === "chat") return "Ask anything about your materials or general study topics. You can also request practice questions or summaries."
    if (studyMode === "questions") return "Upload materials to generate practice questions automatically, or ask for specific questions."
    if (studyMode === "summary") return "Upload materials to get concise summaries with key points and important concepts."
    if (studyMode === "explain") return "Upload materials or ask questions to get detailed explanations of complex concepts."
    return "Your AI-powered study companion."
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isChatMode = studyMode === "chat"
  const hasProcessedMaterials = uploadedFiles.filter((f) => f.processingStatus === "completed").length > 0

  // Theme-based classes for text and backgrounds
  const textPrimary = mounted && theme === "dark" ? "text-white" : "text-gray-900"
  const textSecondary = mounted && theme === "dark" ? "text-slate-300" : "text-gray-600"
  const cardHeaderBg = mounted && theme === "dark"
    ? "bg-gradient-to-r from-slate-800 to-slate-700"
    : "bg-gradient-to-r from-blue-50 to-green-50"
  const cardBg = mounted && theme === "dark" ? "bg-slate-900" : "bg-white"
  const borderColor = mounted && theme === "dark" ? "border-slate-700" : "border-b"
  const iconUser = mounted && theme === "dark" ? "text-blue-400" : "text-blue-500"
  const iconAI = mounted && theme === "dark" ? "text-green-300" : "text-blue-500"
  const iconSparkles = mounted && theme === "dark" ? "text-slate-600" : "text-gray-300"
  const inputBg = mounted && theme === "dark"
    ? "bg-slate-800 text-white placeholder:text-slate-400"
    : ""
  const inputBorder = mounted && theme === "dark"
    ? "border-slate-700 focus:border-slate-500"
    : ""
  const cardFooterBorder = mounted && theme === "dark"
    ? "border-t border-slate-700"
    : "border-t"

  // Prompt UI after upload
  const showPrompt = showPostUploadPrompt && onPostUploadAction;
  // Prompt UI for explain mode after free chat
  const showExplain = showExplainPrompt && onExplainPromptDismiss;

  return (
    <Card className={`flex flex-col h-full border-0 shadow-none ${cardBg}`}>
      {/* Post-upload prompt */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material Ready!</h2>
              <p className="text-gray-600 dark:text-gray-300">Your material has been uploaded and processed. What would you like to do next?</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={() => onPostUploadAction("explain")}
              >
                Explain Concepts
              </button>
              <button
                className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={() => onPostUploadAction("questions")}
              >
                Generate Questions
              </button>
              <button
                className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                onClick={() => onPostUploadAction("summary")}
              >
                Summarise
              </button>
              <button
                className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
                onClick={() => onPostUploadAction("chat")}
              >
                Free Chat
              </button>
              <button
                className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium mt-2"
                onClick={() => onPostUploadAction(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Explain prompt after free chat */}
      {showExplain && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-orange-600 dark:text-orange-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material Detected!</h2>
              <p className="text-gray-600 dark:text-gray-300">We detected your uploaded material. What would you like Alex AI to do?</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={() => { onExplainPromptDismiss(); if (onPostUploadAction) onPostUploadAction("explain") }}
              >
                Explain Concepts
              </button>
              <button
                className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={() => { onExplainPromptDismiss(); if (onPostUploadAction) onPostUploadAction("questions") }}
              >
                Generate Questions
              </button>
              <button
                className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                onClick={() => { onExplainPromptDismiss(); if (onPostUploadAction) onPostUploadAction("summary") }}
              >
                Summarise
              </button>
              <button
                className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium mt-2"
                onClick={onExplainPromptDismiss}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <CardHeader className={`${borderColor} ${cardHeaderBg} flex-shrink-0`}>
        <CardTitle className={`text-xl flex items-center gap-2 ${textPrimary}`}>
          <MessageCircle className={`h-5 w-5 ${iconAI}`} />
          {getChatTitle()}
        </CardTitle>
        <p className={`text-sm ${textSecondary}`}>{getChatDescription()}</p>
        <div className="flex gap-2 mt-2">
          {sessionId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateExamFromChat}
                disabled={isLoading || !canUseAI}
                className={`flex items-center gap-2 bg-transparent ${textPrimary}`}
              >
                <BookOpen className={`h-4 w-4 ${iconAI}`} />
                {isLoading || isGeneratingExam ? "Generating..." : "Exam from Chat"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadChat}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-transparent ${textPrimary}`}
              >
                <Download className={`h-4 w-4 ${iconAI}`} />
                Download Chat
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className={`flex-1 p-4 overflow-hidden ${cardBg} relative`}>
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div ref={setScrollableDiv} className="h-full overflow-y-auto">
            <div className="space-y-6 pb-4">
              {/* File status bubbles at the top */}
              {fileMessages.slice().reverse().map(msg => (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-lg shadow bg-gray-100 text-gray-800 border border-gray-300 rounded-bl-none">
                    <p className="text-sm font-semibold">{msg.fileName}</p>
                    <p className="text-xs">{msg.status === "uploading" && "Uploading..."}
                    {msg.status === "processing" && "Processing..."}
                    {msg.status === "completed" && "Extracted!"}
                    {msg.status === "failed" && "Failed."}</p>
                    {msg.status === "completed" && msg.extractedText && (
                      <p className="text-xs mt-2 line-clamp-2">Preview: {msg.extractedText}</p>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className={`text-center py-8 ${textSecondary}`}>
                  <Sparkles className={`h-12 w-12 mx-auto mb-4 ${iconSparkles}`} />
                  <p className={textPrimary}>Start a conversation with Alex AI!</p>
                  {hasProcessedMaterials && (
                    <p className={`text-sm mt-2 ${textSecondary}`}>Ask about your uploaded materials or general study topics.</p>
                  )}
                  {!hasProcessedMaterials && (
                    <p className={`text-sm mt-2 ${textSecondary}`}>
                      Upload materials in the &quot;Upload & Process&quot; tab to get personalized help.
                    </p>
                  )}
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group relative items-end px-2`}> {/* px-2 for edge padding */}
                  {/* Copy icon outside bubble, vertically centered */}
                  {msg.role === "user" && (
                    <button
                      className="ml-2 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200 p-1 bg-transparent border-none focus:outline-none"
                      style={{ zIndex: 2 }}
                      onClick={() => handleCopy(msg.content)}
                      title="Copy"
                      tabIndex={0}
                      type="button"
                    >
                      <Copy className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    </button>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-lg relative ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-3xl rounded-tr-2xl rounded-tl-2xl"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-bl-3xl rounded-tl-2xl rounded-tr-2xl"
                    }`}
                    style={{ position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                  >
                    {/* Message content rendering restored */}
                    {msg.role === "assistant" && msg.metadata?.quickActions ? (
                      <>
                        <p className="mb-2">I&apos;ve extracted your document. What would you like to do?</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleQuickAction("explain")}>Explain</Button>
                          <Button size="sm" onClick={() => handleQuickAction("questions")}>Generate Questions</Button>
                          <Button size="sm" onClick={() => handleQuickAction("summary")}>Summarise</Button>
                        </div>
                      </>
                    ) : msg.role === "assistant" ? (
                      <div className={`prose prose-sm dark:prose-invert max-w-none`}>
                        <ReactMarkdown
                          components={{
                            strong: (props) => <strong className="font-semibold text-blue-700 dark:text-blue-300" {...props} />, // style bold
                            em: (props) => <em className="italic text-purple-700 dark:text-purple-300" {...props} />, // style italics
                            ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
                            ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
                            li: (props) => <li className="mb-1" {...props} />,
                            code: (props) => <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded text-xs" {...props} />,
                            h2: (props) => <h2 className="font-bold text-lg mt-2 mb-1 text-blue-800 dark:text-blue-200" {...props} />,
                            h3: (props) => <h3 className="font-semibold text-base mt-2 mb-1 text-blue-700 dark:text-blue-300" {...props} />,
                            p: (props) => <p className="mb-2" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs opacity-70 text-right block" style={{ fontSize: '0.75rem' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {/* Copy icon for AI, left of bubble */}
                  {msg.role === "assistant" && (
                    <button
                      className="mr-2 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200 p-1 bg-transparent border-none focus:outline-none"
                      style={{ zIndex: 2 }}
                      onClick={() => handleCopy(msg.content)}
                      title="Copy"
                      tabIndex={0}
                      type="button"
                    >
                      <Copy className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl shadow-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-bl-3xl rounded-tl-2xl rounded-tr-2xl flex items-center gap-2">
                    <Loader2 className={`h-4 w-4 animate-spin ${iconAI}`} />
                    <span className="text-sm">Alex AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className={`${cardFooterBorder} p-4 flex-shrink-0`}>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder={canUseAI ? "Type your message..." : "AI features are disabled. Request premium access."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !canUseAI}
            className={`flex-1 ${inputBg} ${inputBorder}`}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,image/*"
            onChange={handleFileChange}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !canUseAI}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button type="submit" disabled={isLoading || !canUseAI || !input.trim()}>
            {isLoading ? (
              <Loader2 className={`h-4 w-4 animate-spin ${iconAI}`} />
            ) : (
              <Send className={`h-4 w-4 ${iconUser}`} />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}