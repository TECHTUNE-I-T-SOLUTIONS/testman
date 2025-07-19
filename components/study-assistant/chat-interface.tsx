"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Send,
  Paperclip,
  Lightbulb,
  MessageSquareText,
  GraduationCap,
  Sparkles,
  CheckCircle,
  FileText,
  AlertCircle,
  Crown,
} from "lucide-react"
import { toast } from "sonner"
import type { StudyMode } from "@/components/study-assistant/study-mode-selector"
import type { UploadedFile } from "@/components/study-assistant/file-upload" // Assuming UploadedFile is defined here or in a shared type file
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  metadata?: {
    studyMode?: StudyMode
    materialIds?: string[]
    quickActions?: boolean
    fileUpload?: {
      fileName?: string
      status: "uploading" | "processing" | "completed" | "failed"
      materialId?: string
    }
  }
}

interface ChatInterfaceProps {
  studyMode: StudyMode
  materialIds: string[]
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
}

export function ChatInterface({
  studyMode,
  materialIds,
  canUseAI,
  currentSession,
  onSessionUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(currentSession?.messages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(currentSession?.id || null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [examGenerationDialog, setExamGenerationDialog] = useState<{
    open: boolean
    materialId?: string
    examType: string
    questionCount: number
  }>({
    open: false,
    examType: "mixed",
    questionCount: 10
  })

  // Update messages and session ID when currentSession changes (e.g., when loading a history session)
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages || [])
      setSessionId(currentSession.id)
    } else {
      // Reset for new chat
      setMessages([])
      setSessionId(null)
    }
  }, [currentSession])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const uploadAndProcessFile = async (file: File) => {
    const uploadMessageId = Date.now().toString()
    
    // Add upload message to chat
    const uploadMessage: ChatMessage = {
      id: uploadMessageId,
      role: "system",
      content: `📎 Uploading ${file.name}...`,
      timestamp: new Date().toISOString(),
      metadata: {
        fileUpload: {
          fileName: file.name,
          status: "uploading"
        }
      }
    }
    
    setMessages(prev => [...prev, uploadMessage])

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("subject", "Study Material")

      const response = await fetch("/api/study-materials/upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      // Update upload message to show processing
      setMessages(prev => prev.map(msg => 
        msg.id === uploadMessageId 
          ? {
              ...msg,
              content: `⚙️ Processing ${file.name}...`,
              metadata: {
                ...msg.metadata,
                fileUpload: {
                  fileName: file.name,
                  status: "processing",
                  materialId: data.material.id
                }
              }
            }
          : msg
      ))

      // Poll for processing completion
      await pollProcessingStatus(data.material.id, uploadMessageId)

    } catch (error) {
      console.error("Upload error:", error)
      setMessages(prev => prev.map(msg => 
        msg.id === uploadMessageId 
          ? {
              ...msg,
              content: `❌ Failed to upload ${file.name}`,
              metadata: {
                ...msg.metadata,
                fileUpload: {
                  ...msg.metadata?.fileUpload,
                  status: "failed"
                }
              }
            }
          : msg
      ))
    } finally {
      // Upload completed
    }
  }

  const pollProcessingStatus = async (materialId: string, messageId: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? {
                ...msg,
                content: `⏰ Processing timed out for ${msg.metadata?.fileUpload?.fileName || 'document'}`,
                metadata: {
                  ...msg.metadata,
                  fileUpload: {
                    fileName: msg.metadata?.fileUpload?.fileName || 'document',
                    status: "failed"
                  }
                }
              }
            : msg
        ))
        return
      }

      try {
        const response = await fetch(`/api/study-materials/status?materialId=${materialId}`)
        const data = await response.json()

        if (data.status === "completed") {
          // Show success and quick actions
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  content: `✅ ${msg.metadata?.fileUpload?.fileName || 'document'} processed successfully!`,
                  metadata: {
                    ...msg.metadata,
                    fileUpload: {
                      fileName: msg.metadata?.fileUpload?.fileName || 'document',
                      status: "completed"
      }
    }
                }
              : msg
          ))

          // Add quick actions message
          const quickActionsMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: `Great! I've analyzed the document. What would you like me to do with it?`,
            timestamp: new Date().toISOString(),
            metadata: {
              quickActions: true,
              materialIds: [materialId]
            }
          }
          
          setMessages(prev => [...prev, quickActionsMessage])
          onSessionUpdate() // Refresh session to include new material
          
        } else if (data.status === "failed") {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  content: `❌ Failed to process ${msg.metadata?.fileUpload?.fileName || 'document'}`,
                  metadata: {
                    ...msg.metadata,
                    fileUpload: {
                      fileName: msg.metadata?.fileUpload?.fileName || 'document',
                      status: "failed"
                    }
    }
                }
              : msg
          ))
        } else {
          // Still processing, continue polling
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        }
      } catch (error) {
        console.error("Polling error:", error)
        attempts++
        setTimeout(poll, 5000)
      }
    }

    poll()
  }

  const handleQuickAction = async (action: string, materialId?: string) => {
    if (!materialId) return
    
    // Handle exam generation separately
    if (action.includes("Generate practice questions") || action.includes("Generate Exam")) {
      setExamGenerationDialog({
        open: true,
        materialId,
        examType: "mixed",
        questionCount: 10
      })
      return
    }
    
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: action,
      timestamp: new Date().toISOString(),
      metadata: { materialIds: [materialId] }
    }
    
    setMessages(prev => [...prev, actionMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conversationHistory: [...messages, actionMessage],
          message: action,
          studyMode: action.includes("summarize") ? "summary" : 
                    action.includes("explain") ? "explain" : 
                    action.includes("exam") ? "questions" : "chat",
          materialIds: [materialId],
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
        setMessages(prev => [...prev, aiMessage])
        setSessionId(data.sessionId)
        onSessionUpdate()
      } else {
        throw new Error("Failed to get AI response")
      }
    } catch (error) {
      console.error("Quick action error:", error)
      toast.error("Failed to process action")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateExam = async () => {
    if (!examGenerationDialog.materialId) return
    
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Generate ${examGenerationDialog.examType} practice exam with ${examGenerationDialog.questionCount} questions`,
      timestamp: new Date().toISOString(),
      metadata: { materialIds: [examGenerationDialog.materialId] }
    }
    
    setMessages(prev => [...prev, actionMessage])
    setIsLoading(true)
    setExamGenerationDialog(prev => ({ ...prev, open: false }))

    try {
      const response = await fetch("/api/ai/practice-exam/generate-from-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialIds: [examGenerationDialog.materialId],
          examType: examGenerationDialog.examType,
          questionCount: examGenerationDialog.questionCount,
          sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: ChatMessage = {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: `✅ Practice exam "${data.exam.title}" generated successfully with ${data.exam.questionsCount} questions!\n\nYou can now take this exam from the Practice Exams tab.`,
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiMessage])
        onSessionUpdate()
        toast.success("Practice exam generated successfully!")
      } else {
        throw new Error("Failed to generate exam")
      }
    } catch (error) {
      console.error("Exam generation error:", error)
      toast.error("Failed to generate practice exam")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimpleAction = (action: string) => {
    setInput(action)
    // Optionally, trigger send immediately: handleSendMessage();
  }

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

    /* ----- SEND TO BACK-END ----------------------------------- */
    try {
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conversationHistory: [...messages, userMessage], // Send full history
          message: userMessage.content, // the current question
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
        onSessionUpdate() // refresh history panel
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

  const isNewChat = messages.length === 0

  return (
    <div className="relative flex flex-col h-full w-full">
      {" "}
      {/* Removed overflow-hidden here */}
      {isNewChat ? (
        // Initial state: centered, compact input and quick prompts
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-6">
          <img src="/alex.png" alt="Alex AI Logo" className="h-20 w-20 rounded-full mb-4 opacity-60" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">What can I help with?</h1>
          <div className="w-full max-w-xl">
            <form className="relative flex items-center w-full" onSubmit={handleSendMessage}>
              <Input
                placeholder={canUseAI ? "Ask anything" : "AI features are disabled. Request premium access."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || !canUseAI}
                className="flex-1 text-base rounded-xl pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  await uploadAndProcessFile(file)
                  e.target.value = ""
                }}
              />
              {canUseAI ? (
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-black dark:text-white hover:bg-blue-700"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  <span className="sr-only">Send message</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    const event = new CustomEvent('showUpgradeModal')
                    window.dispatchEvent(event)
                  }}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
                  title="Upgrade to Premium"
                >
                  <Crown className="h-5 w-5" />
                  <span className="sr-only">Upgrade to Premium</span>
                </Button>
              )}
            </form>
            {/* Suggested Actions */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={!canUseAI}
                className={`rounded-full px-4 py-2 text-sm border-gray-300 dark:border-gray-700 bg-transparent ${
                  canUseAI 
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => handleSimpleAction("Surprise me with a study fact!")}
              >
                <Sparkles className="h-4 w-4 mr-2" /> Surprise me
              </Button>
              <Button
                variant="outline"
                disabled={!canUseAI}
                className={`rounded-full px-4 py-2 text-sm border-gray-300 dark:border-gray-700 bg-transparent ${
                  canUseAI 
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => handleSimpleAction("Brainstorm essay topics for me.")}
              >
                <Lightbulb className="h-4 w-4 mr-2" /> Brainstorm
              </Button>
              <Button
                variant="outline"
                disabled={!canUseAI}
                className={`rounded-full px-4 py-2 text-sm border-gray-300 dark:border-gray-700 bg-transparent ${
                  canUseAI 
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => handleSimpleAction("Give me advice on time management for exams.")}
              >
                <GraduationCap className="h-4 w-4 mr-2" /> Get advice
              </Button>
              <Button
                variant="outline"
                disabled={!canUseAI}
                className={`rounded-full px-4 py-2 text-sm border-gray-300 dark:border-gray-700 bg-transparent ${
                  canUseAI 
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" 
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => handleSimpleAction("Summarize this concept: [insert concept]")}
              >
                <MessageSquareText className="h-4 w-4 mr-2" /> Summarize text
              </Button>
            </div>
            {/* Disclaimer Footer */}
            <div className="w-full text-xs text-gray-500 dark:text-gray-400 text-center py-2 px-4">
              By messaging Alex AI, you agree to our{" "}
              <a href="/terms" className="underline hover:text-blue-500">
                Terms
              </a>{" "}
              and have read our{" "}
              <a href="/privacy" className="underline hover:text-blue-500">
                Privacy Policy
              </a>
              .
            </div>
            {/* Additional Disclaimer Footer */}
            <div className="w-full text-xs text-gray-500 dark:text-gray-400 text-center py-2 px-4">
              Alex AI is not a substitute for professional studying. It can make mistakes and errors, use with caution and please bear with us as we make it better.
            </div>
          </div>
        </div>
      ) : (
        // Active chat state: messages scroll, input fixed at bottom
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-40 space-y-4 max-w-3xl mx-auto w-full"> {/* pb-40 for input height */}
        {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
                  className={`max-w-[75%] p-3 rounded-xl shadow-sm relative whitespace-pre-line text-base ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {msg.role === "system" && msg.metadata?.fileUpload ? (
                    <div className="flex items-center gap-2">
                      {msg.metadata.fileUpload.status === "uploading" && <FileText className="h-4 w-4 animate-pulse" />}
                      {msg.metadata.fileUpload.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                      {msg.metadata.fileUpload.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {msg.metadata.fileUpload.status === "failed" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span>{msg.content}</span>
                    </div>
                  ) : msg.role === "assistant" && msg.metadata?.quickActions ? (
                    <div>
                      <div className="mb-3">{msg.content}</div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("Summarize this document", msg.metadata?.materialIds?.[0])}
                          className="text-xs"
                        >
                          📝 Summarize
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("Explain the key concepts in this document", msg.metadata?.materialIds?.[0])}
                          className="text-xs"
                        >
                          💡 Explain
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction("Generate practice questions from this document", msg.metadata?.materialIds?.[0])}
                          className="text-xs"
                        >
                          🎯 Generate Exam
                        </Button>
                      </div>
                    </div>
                  ) : msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  <div className="flex justify-end mt-1">
                    <span className="text-xs opacity-70 text-right block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-xl shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm">Alex AI is thinking...</span>
            </div>
          </div>
        )}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
      </div>
          {/* Input Area and Disclaimer Container - fixed at the bottom */}
          <div className="w-full bg-white dark:bg-[#000000FF] border-t border-gray-200 dark:border-gray-700 fixed left-0 right-0 bottom-0 z-30" style={{maxWidth: '768px', margin: '0 auto'}}>
            {/* Input Area */}
            <div className="pt-4 pb-2 flex flex-col items-center">
              <div className="w-full max-w-3xl px-4">
                <form className="relative flex items-center w-full" onSubmit={handleSendMessage}>
          <Input
                    placeholder={canUseAI ? "Message Alex AI..." : "AI features are disabled. Request premium access."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !canUseAI}
                    className="flex-1 text-base rounded-xl pl-12 pr-24 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      await uploadAndProcessFile(file)
                      e.target.value = ""
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {canUseAI ? (
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="bg-transparent text-white hover:bg-blue-700"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        <span className="sr-only">Send message</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          // This will be handled by the sidebar usage banner modal
                          // We'll trigger the modal from the context
                          const event = new CustomEvent('showUpgradeModal')
                          window.dispatchEvent(event)
                        }}
                        size="icon"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
                        title="Upgrade to Premium"
                      >
                        <Crown className="h-5 w-5" />
                        <span className="sr-only">Upgrade to Premium</span>
                      </Button>
                    )}
                  </div>
        </form>
      </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="w-full text-xs text-gray-500 dark:text-gray-400 text-center py-2 px-4">
              By messaging Alex AI, you agree to our{" "}
              <a href="/terms" className="underline hover:text-blue-500">
                Terms
              </a>{" "}
              and have read our{" "}
              <a href="/privacy" className="underline hover:text-blue-500">
                Privacy Policy
              </a>
              .
            </div>
          </div>
        </div>
      )}
      {/* Exam Generation Dialog */}
      <Dialog open={examGenerationDialog.open} onOpenChange={(open) => setExamGenerationDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Practice Exam</DialogTitle>
            <DialogDescription>
              Choose the type of exam and number of questions to generate from your uploaded document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Exam Type</Label>
              <RadioGroup
                value={examGenerationDialog.examType}
                onValueChange={(value) => setExamGenerationDialog(prev => ({ ...prev, examType: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="objective" id="objective" />
                  <Label htmlFor="objective">Objective (Multiple Choice)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="theory" id="theory" />
                  <Label htmlFor="theory">Theory (Short Answer)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mixed (Both Types)</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="questionCount" className="text-sm font-medium">Number of Questions</Label>
              <Select
                value={examGenerationDialog.questionCount.toString()}
                onValueChange={(value) => setExamGenerationDialog(prev => ({ ...prev, questionCount: parseInt(value) }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamGenerationDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button onClick={handleGenerateExam} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
