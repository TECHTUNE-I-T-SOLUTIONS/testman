"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, FileText, Lightbulb, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

export default function StudyModeSelector({ selectedMode, onModeChange, disabled }: StudyModeSelectorProps) {
  const [showHelp, setShowHelp] = useState(false)

  const helpContent = {
    chat: "💬 **Free Chat Mode**: Ask any academic question, get explanations, study tips, and general academic guidance. Perfect for open discussions and learning!",
    questions: "❓ **Generate Questions Mode**: Upload your study materials and get practice questions automatically generated. Great for exam preparation!",
    summary: "📄 **Summary Mode**: Get concise summaries of your uploaded materials with key points and important concepts highlighted.",
    explain: "💡 **Explain Mode**: Get detailed explanations of complex concepts from your materials or ask specific questions for clarification."
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Select Study Mode</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                onClick={() => setShowHelp(!showHelp)}
              >
                <Info className="h-4 w-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click for study mode guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showHelp && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 space-y-3">
          <h4 className="font-semibold text-blue-900">📚 How to Use Study Modes:</h4>
          {Object.entries(helpContent).map(([mode, description]) => (
            <div key={mode} className="text-sm text-blue-800">
              {description}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(false)}
            className="mt-2"
          >
            Got it!
          </Button>
        </div>
      )}

      {modes.map((mode) => {
        const Icon = mode.icon
        const isDisabled = disabled && mode.requiresFiles
        const isSelected = selectedMode === mode.id

        return (
          <Button
            key={mode.id}
            variant="outline"
            className={cn(
              "w-full justify-start p-4 h-auto text-left transition-all duration-200",
              isSelected
                ? `${mode.bgColor} ${mode.borderColor} border-2 shadow-md`
                : "bg-white hover:bg-gray-50 border-gray-200",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !isDisabled && onModeChange(mode.id)}
            disabled={isDisabled}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={cn("p-2 rounded-lg", isSelected ? mode.color : "bg-gray-200")}>
                <Icon className={cn("h-5 w-5", isSelected ? "text-white" : "text-gray-600")} />
              </div>
              <div className="flex-1">
                <div className={cn("font-medium", isSelected ? mode.textColor : "text-gray-900")}>
                  {mode.title}
                </div>
                <div className="text-sm text-gray-500 mt-1">{mode.description}</div>
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}