"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, FileText, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

export type StudyMode = "questions" | "summary" | "explain" | "chat"

interface StudyModeSelectorProps {
  selectedMode: StudyMode
  onModeChange: (mode: StudyMode) => void
  disabled?: boolean
}

const modes = [
  {
    id: "chat" as StudyMode,
    title: "Free Chat",
    description: "Ask anything, get explanations",
    icon: MessageCircle,
    color: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    requiresFiles: false,
  },
  {
    id: "questions" as StudyMode,
    title: "Generate Questions",
    description: "Create practice questions from materials",
    icon: HelpCircle,
    color: "bg-green-500 hover:bg-green-600",
    textColor: "text-green-700",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
    requiresFiles: true,
  },
  {
    id: "summary" as StudyMode,
    title: "Summarize",
    description: "Get key points and summaries",
    icon: FileText,
    color: "bg-purple-500 hover:bg-purple-600",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    requiresFiles: true,
  },
  {
    id: "explain" as StudyMode,
    title: "Explain Concepts",
    description: "Get detailed explanations",
    icon: Lightbulb,
    color: "bg-orange-500 hover:bg-orange-600",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
    requiresFiles: true,
  },
]

export function StudyModeSelector({ selectedMode, onModeChange, disabled = false }: StudyModeSelectorProps) {
  return (
    <div className="space-y-3">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isSelected = selectedMode === mode.id
        const isDisabled = disabled && mode.requiresFiles

        return (
          <Button
            key={mode.id}
            variant="outline"
            className={cn(
              "w-full h-auto p-4 justify-start text-left transition-all duration-200",
              isSelected
                ? `${mode.bgColor} ${mode.borderColor} ${mode.textColor} border-2`
                : "bg-white hover:bg-gray-50 border-gray-200",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !isDisabled && onModeChange(mode.id)}
            disabled={isDisabled}
          >
            <div className="flex items-start gap-3 w-full">
              <div className={cn("p-2 rounded-lg flex-shrink-0", isSelected ? "bg-white shadow-sm" : mode.color)}>
                <Icon className={cn("h-4 w-4", isSelected ? mode.textColor : "text-white")} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-sm mb-1">{mode.title}</div>
                <div className="text-xs text-gray-600 leading-relaxed break-words">{mode.description}</div>
                {mode.requiresFiles && <div className="text-xs text-gray-500 mt-1 italic">Requires uploaded files</div>}
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
