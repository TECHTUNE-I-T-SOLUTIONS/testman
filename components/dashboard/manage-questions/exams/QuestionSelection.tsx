"use client"

import { useEffect, useState } from "react"
import type { UseFormSetValue } from "react-hook-form"
import { Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Question {
  _id: string
  questionText: string
  createdAt?: string
}

interface ExamFormData {
  courseId: string
  title: string
  duration: number
  selectedQuestions: string[]
  scheduledTime?: string
}

interface Props {
  courseId: string
  setValue: UseFormSetValue<ExamFormData>
  selectedQuestions: string[]
}

export default function QuestionSelection({ courseId, setValue, selectedQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!courseId) return

    const fetchQuestions = async (): Promise<void> => {
      setLoading(true)
      try {
        const response = await fetch(`/api/questions?courseId=${courseId}&sort=${sortOrder}`)
        if (!response.ok) throw new Error("Failed to fetch questions")
        const data: Question[] = await response.json()
        setQuestions(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [courseId, sortOrder])

  const toggleSelection = (id: string) => {
    const updatedSelection = selectedQuestions.includes(id)
      ? selectedQuestions.filter((q) => q !== id)
      : [...selectedQuestions, id]
    setValue("selectedQuestions", updatedSelection)
  }

  const filteredQuestions = questions.filter((q) => {
    if (!searchTerm) return true
    if (!q.createdAt) return false
    const questionDate = new Date(q.createdAt).toISOString().split("T")[0]
    return questionDate === searchTerm
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Select Questions
        </CardTitle>
        <CardDescription>Choose questions to include in this examination</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Sort Controls */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              placeholder="Filter by date"
            />
          </div>
          <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions List */}
        <ScrollArea className="h-64 border rounded-lg">
          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading questions...</p>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <div
                  key={q._id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleSelection(q._id)}
                >
                  <Checkbox
                    checked={selectedQuestions.includes(q._id)}
                    onChange={() => toggleSelection(q._id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Unknown Date"}
                    </Badge>
                    <p className="text-sm">{q.questionText}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No questions match your search criteria.</p>
            )}
          </div>
        </ScrollArea>

        {selectedQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} selected
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
