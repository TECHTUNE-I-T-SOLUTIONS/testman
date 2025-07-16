"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Loader2, Sparkles, BookOpen, Download } from "lucide-react"
import { toast } from "sonner"
import type { StudyMode } from "@/app/student/study-assistant/page"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    studyMode?: StudyMode
    materialIds?: string[]
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
}

export function ChatInterface({
  studyMode,
  materialIds,
  uploadedFiles,
  canUseAI,
  currentSession,
  onSessionUpdate,
  onPracticeExamGenerated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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
    if (!sessionId) {
      toast.error("No active chat session to generate an exam from.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/practice-exam/generate-from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionCount: 10 }), // Default 10 questions
      })

      if (response.ok) {
        toast.success("Practice exam generated from chat successfully!")
        onPracticeExamGenerated() // Notify parent to refresh exams list and switch tab
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to generate practice exam from chat.")
      }
    } catch (error) {
      console.error("Error generating exam from chat:", error)
      toast.error("Error generating practice exam from chat.")
    } finally {
      setIsLoading(false)
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
    if (studyMode === "chat") return "Ask anything about your materials or general study topics."
    if (studyMode === "questions") return "Ask for practice questions based on your materials."
    if (studyMode === "summary") return "Get concise summaries of your uploaded content."
    if (studyMode === "explain") return "Request explanations for complex concepts."
    return "Your AI-powered study companion."
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isChatMode = studyMode === "chat"
  const hasProcessedMaterials = uploadedFiles.filter((f) => f.processingStatus === "completed").length > 0

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          {getChatTitle()}
        </CardTitle>
        <p className="text-sm text-gray-600">{getChatDescription()}</p>
        <div className="flex gap-2 mt-2">
          {sessionId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateExamFromChat}
                disabled={isLoading || !canUseAI}
                className="flex items-center gap-2 bg-transparent"
              >
                <BookOpen className="h-4 w-4" />
                {isLoading ? "Generating..." : "Exam from Chat"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadChat}
                disabled={isLoading}
                className="flex items-center gap-2 bg-transparent"
              >
                <Download className="h-4 w-4" />
                Download Chat
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with Alex AI!</p>
                {hasProcessedMaterials && (
                  <p className="text-sm mt-2">Ask about your uploaded materials or general study topics.</p>
                )}
                {!hasProcessedMaterials && (
                  <p className="text-sm mt-2">
                    Upload materials in the &quot;Upload & Process&quot; tab to get personalized help.
                  </p>
                )}
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="block text-right text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-gray-100 text-gray-800 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Alex AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder={canUseAI ? "Type your message..." : "AI features are disabled. Request premium access."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !canUseAI}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !canUseAI || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
