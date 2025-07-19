"use client"

import { useEffect, useState, useRef } from "react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { MoreVertical, Download, Trash2, Plus, MessageCircle, History } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import StudyModeSelector, { type StudyMode } from "@/components/study-assistant/study-mode-selector"
import { getStudentFromToken } from "@/utils/auth"
import { SidebarUsageBanner } from "@/components/study-assistant/sidebar-usage-banner"

// Define the HistoryChatSession type here or import it from a shared types file
export type HistoryChatSession = {
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

interface Student {
  name?: string;
  // Add other properties as needed
}

interface AppSidebarProps {
  onContinueSession: (session: HistoryChatSession) => void
  onNewChat: () => void
  studyMode: StudyMode
  onModeChange: (mode: StudyMode) => void
}

export function AppSidebar({ onContinueSession, onNewChat, studyMode, onModeChange }: AppSidebarProps) {
  const [student, setStudent] = useState<Student | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canUseAI, setCanUseAI] = useState(true);
  
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const tokenStudent = await getStudentFromToken();
        if (!tokenStudent?.matricNumber) return;
        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber);
        const res = await fetch(`/api/students/${encodedMatric}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        setStudent(data);
      } catch {
        setStudent(null);
      }
    };
    fetchStudentDetails();
  }, []);

  const [history, setHistory] = useState<HistoryChatSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<HistoryChatSession | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { isMobile, setOpenMobile } = useSidebar()

  // Used to prevent double-fetching on new chat
  const fetchedInitialHistory = useRef(false);

  // Fetch history on mount, but only once
  useEffect(() => {
    if (fetchedInitialHistory.current) return;
    fetchedInitialHistory.current = true;
    fetch("/api/chat/sessions?limit=100")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setHistory(data.sessions || []))
      .catch(() => {
        setError("Could not load history.")
        setHistory([])
      })
  }, [])

  const handleDownload = (session: HistoryChatSession) => {
    window.open(`/api/chat/download?sessionId=${session.id}`, "_blank")
  }

  const handleDelete = async (session: HistoryChatSession) => {
    setSessionToDelete(session)
    setShowDeleteModal(true)
  }

  const confirmDeleteSession = async () => {
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
        setHistory((h) => h.filter((s) => s.id !== sessionToDelete.id))
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

  // When a session is continued, update its lastActivity and move it to the top
  const handleSessionClick = (session: HistoryChatSession) => {
    // Move the session to the top and update lastActivity
    const now = new Date().toISOString();
    setHistory((prev) => {
      // Remove the session from its old position
      const filtered = prev.filter((s) => s.id !== session.id);
      // Update lastActivity
      const updatedSession = { ...session, lastActivity: now };
      // Place at the top
      return [updatedSession, ...filtered];
    });
    onContinueSession({ ...session, lastActivity: now });
    if (isMobile) {
      setOpenMobile(false) // Close sidebar on mobile after selecting a session
    }
  }

  // When a new chat is created, optimistically add a new session to the top
  const handleNewChatClick = () => {
    // Create a new session object with a temporary id and minimal info
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const newSession: HistoryChatSession = {
      id: tempId,
      title: "Untitled",
      studyMode,
      materials: [],
      messageCount: 0,
      lastActivity: now,
      createdAt: now,
      messages: [],
    };
    setHistory((prev) => [newSession, ...prev]);
    onNewChat();
    if (isMobile) {
      setOpenMobile(false) // Close sidebar on mobile after starting new chat
    }
    // After onNewChat, the parent will eventually update with the real session (with real id)
    // Optionally, you could listen for a prop or event to replace the temp session with the real one
  }

  // Helper to group sessions by date
  function groupSessionsByDate(sessions: HistoryChatSession[]): Record<string, HistoryChatSession[]> {
    const groups: Record<string, HistoryChatSession[]> = {};
    sessions.forEach((session: HistoryChatSession) => {
      const date = new Date(session.lastActivity);
      const today = new Date();
      let group = date.toDateString();
      if (date.toDateString() === today.toDateString()) group = "Today";
      else if (date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) group = "Yesterday";
      if (!groups[group]) groups[group] = [];
      groups[group].push(session);
    });
    return groups;
  }
  const groupedHistory: Record<string, HistoryChatSession[]> = groupSessionsByDate(history);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Alex AI Branding */}
      <div className="flex flex-col items-center py-6">
        <img src="/alex.png" alt="Alex AI Logo" className="h-12 w-12 rounded-full mb-2" />
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-blue-700 dark:text-blue-200 tracking-wide">Alex AI</span>
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
            in beta
          </span>
        </div>
      </div>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleNewChatClick} tooltip="New Chat">
              <Plus />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Study Modes</SidebarGroupLabel>
          <SidebarGroupContent>
            <StudyModeSelector selectedMode={studyMode} onModeChange={onModeChange} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Chat History</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {error && <div className="text-center text-red-400 py-4">{error}</div>}
              {!error && history.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">No history yet.</div>
              )}
              {Object.entries(groupedHistory).map(([date, sessions]: [string, HistoryChatSession[]]) => (
                <div key={date} className="mb-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">{date}</div>
                  {sessions.map((session: HistoryChatSession) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton onClick={() => handleSessionClick(session)} tooltip={session.title || "Untitled"}>
                        <MessageCircle className="h-4 w-4" />
                        <span>{session.title || "Untitled"}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover>
                            <MoreVertical />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem onClick={() => handleDownload(session)}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(session)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* AI Usage Banner */}
        <SidebarUsageBanner onUsageUpdate={setCanUseAI} />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={student?.name || "User Settings"}>
              <img src="/alex.png" alt="User Avatar" className="h-6 w-6 rounded-full" />
              <span>{student?.name || "Student"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Session</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete &quot;{sessionToDelete?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteSession}
                disabled={deleting}
                className="dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  )
}
