"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { HistoryChatSession } from "@/components/study-assistant/Sidebar"
import type { StudyMode } from "@/components/study-assistant/study-mode-selector"
import type { UploadedFile } from "@/components/study-assistant/file-upload"

interface StudyAssistantContextType {
  studyMode: StudyMode
  setStudyMode: (mode: StudyMode) => void
  currentSession: HistoryChatSession | null
  setCurrentSession: (session: HistoryChatSession | null) => void
  uploadedFiles: UploadedFile[]
  setUploadedFiles: (files: UploadedFile[]) => void
  canUseAI: boolean
  setCanUseAI: (canUse: boolean) => void
  handleContinueSession: (session: HistoryChatSession) => void
  handleNewChat: () => void
  handleModeChange: (mode: StudyMode) => void
}

const StudyAssistantContext = createContext<StudyAssistantContextType | undefined>(undefined)

export function StudyAssistantProvider({ children }: { children: ReactNode }) {
  const [studyMode, setStudyMode] = useState<StudyMode>("chat")
  const [currentSession, setCurrentSession] = useState<HistoryChatSession | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [canUseAI, setCanUseAI] = useState(true)

  const handleContinueSession = useCallback((session: HistoryChatSession) => {
    setCurrentSession(session)
    setStudyMode(session.studyMode || "chat")
    setUploadedFiles(
      (session.materials || []).map((m) => ({
        id: m.id,
        title: m.name,
        fileName: m.name,
        fileType: m.type || "unknown",
        processingStatus: "completed" as const,
        uploadProgress: undefined,
        extractedText: m.content || undefined,
      }))
    )
  }, [])

  const handleNewChat = useCallback(() => {
    setCurrentSession(null)
    setStudyMode("chat")
    setUploadedFiles([])
  }, [])

  const handleModeChange = useCallback((mode: StudyMode) => {
    setStudyMode(mode)
  }, [])

  const value: StudyAssistantContextType = {
    studyMode,
    setStudyMode,
    currentSession,
    setCurrentSession,
    uploadedFiles,
    setUploadedFiles,
    canUseAI,
    setCanUseAI,
    handleContinueSession,
    handleNewChat,
    handleModeChange,
  }

  return (
    <StudyAssistantContext.Provider value={value}>
      {children}
    </StudyAssistantContext.Provider>
  )
}

export function useStudyAssistant() {
  const context = useContext(StudyAssistantContext)
  if (context === undefined) {
    throw new Error("useStudyAssistant must be used within a StudyAssistantProvider")
  }
  return context
} 