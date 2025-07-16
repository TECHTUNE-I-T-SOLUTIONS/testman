"use client"

import { useState, useEffect } from "react"
import { HelpCircle, Plus, Upload, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown"
import OptionInput from "@/components/dashboard/manage-questions/questions/OptionInput"
import FileUpload from "@/components/dashboard/manage-questions/questions/FileUpload"
import QuestionsList from "@/components/dashboard/manage-questions/questions/QuestionList"

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  _id: string
  courseId: string
  questionText: string
  options: Option[]
  createdAt: string
}

export default function QuestionsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [questionText, setQuestionText] = useState<string>("")
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true)
      fetch(`/api/questions?courseId=${selectedCourse}&sort=${sortOrder}`)
        .then((res) => res.json())
        .then((data: Question[]) => {
          setQuestions(data)
          setLoading(false)
        })
        .catch(() => {
          toast.error("Error fetching questions")
          setLoading(false)
        })
    }
  }, [selectedCourse, sortOrder])

  const addQuestion = async () => {
    if (!selectedCourse || !questionText.trim() || options.length < 2) {
      return toast.error("Select a course, enter a question, and provide at least two options")
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          questionText,
          options,
        }),
      })
      if (!response.ok) throw new Error("Failed to add question")
      const newQuestion: Question = await response.json()
      setQuestions([...questions, newQuestion])
      toast.success("Question added successfully!")
      setQuestionText("")
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    }
  }

  const deleteQuestion = async (id: string) => {
    try {
      const response = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error("Failed to delete question")
      setQuestions(questions.filter((q) => q._id !== id))
      toast.success("Question deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            Create Questions
          </h1>
          <p className="text-muted-foreground mt-1">Build your question bank for examinations</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Question Creation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Question
              </CardTitle>
              <CardDescription>Create individual questions for your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />

              {selectedCourse && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question Text</Label>
                    <Textarea
                      id="questionText"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Enter your question here..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <OptionInput options={options} setOptions={setOptions} />

                  <Button onClick={addQuestion} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Upload
              </CardTitle>
              <CardDescription>Upload multiple questions from an Excel file</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload selectedCourse={selectedCourse} />
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Sort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Sort by Date</Label>
                <Select value={sortOrder} onValueChange={(value: "desc" | "asc") => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <QuestionsList questions={questions} deleteQuestion={deleteQuestion} />
          )}
        </div>
      </div>
    </div>
  )
}
