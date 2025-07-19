"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, MessageCircle, Download, Trash2, Play, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"

type StudyMode = "flashcards" | "quiz" | "summary" | "chat" // Replace with actual modes as needed

interface ChatSession {
  id: string
  title: string
  studyMode: StudyMode
  materials: {
    id: string
    name: string
    content: string
    type: string
  }[]
  messageCount: number
  lastActivity: string
  createdAt: string
  messages: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }[]
}

interface SessionHistoryProps {
  onContinueSession: (session: ChatSession) => void
}

export function SessionHistory({ onContinueSession }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/chat/sessions?limit=20")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    try {
      setDeleting(true)
      const response = await fetch("/api/chat/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionToDelete.id }),
      })

      if (response.ok) {
        toast.success("Session deleted successfully")
        setSessions(sessions.filter((s) => s.id !== sessionToDelete.id))
        setShowDeleteModal(false)
        setSessionToDelete(null)
      } else {
        toast.error("Failed to delete session")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Error deleting session")
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadSession = async (session: ChatSession, format: "txt" | "json" = "txt") => {
    try {
      const response = await fetch(`/api/chat/download?sessionId=${session.id}&format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${session.title.replace(/[^a-zA-Z0-9]/g, "-")}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Session downloaded successfully")
      } else {
        toast.error("Failed to download session")
      }
    } catch (error) {
      console.error("Error downloading session:", error)
      toast.error("Error downloading session")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Add dark: variants for badge colors
  const getModeColor = (mode: string) => {
    switch (mode) {
      case "questions":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
      case "summary":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "explain":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"
      case "chat":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
    }
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <History className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <History className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            Session History
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Continue previous conversations or download chat history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-600" />
              <p className="text-sm text-gray-700 dark:text-gray-200">No previous sessions found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Start a conversation to see your history here</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <div className="space-y-3">
                      {/* Session Title */}
                      <div>
                        <h4 className="font-medium text-sm break-words leading-relaxed text-gray-900 dark:text-white">
                          {session.title}
                        </h4>
                      </div>

                      {/* Session Info */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`text-xs border ${getModeColor(session.studyMode)}`}>
                          {session.studyMode}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                          {session.messageCount} msgs
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                          {formatDate(session.lastActivity)}
                        </span>
                        {session.materials.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1">
                            <FileText className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                            {session.materials.length} file{session.materials.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onContinueSession(session)}
                          className="flex-1 h-8 text-xs text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Play className="h-3 w-3 mr-1 text-gray-700 dark:text-gray-100" />
                          Continue
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadSession(session)}
                          className="h-8 px-3 text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Download className="h-3 w-3 text-gray-700 dark:text-gray-100" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSessionToDelete(session)
                            setShowDeleteModal(true)
                          }}
                          className="h-8 px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-700 dark:hover:border-red-500"
                        >
                          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="dark:bg-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Delete Session</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete &quot;{sessionToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={deleting}
              className="dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export type { ChatSession as HistoryChatSession }
