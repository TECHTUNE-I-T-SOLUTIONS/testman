"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  correctAnswer: string | boolean | string[]
  explanation?: string
  points: number
}

interface StudentAnswer {
  questionId: string
  answer: string | boolean | string[]
  isCorrect: boolean
  timeSpent: number
}

interface ExamResult {
  id: string
  title: string
  subject: string
  questions: Question[]
  studentAnswers: StudentAnswer[]
  score: number
  percentage: number
  timeSpent: number
  duration: number
  startedAt: string
  completedAt: string
}

export default function ExamResults() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExplanations, setShowExplanations] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/ai/practice-exam?examId=${examId}`)
        if (response.ok) {
          const data = await response.json()
          setResult(data.exam)
        } else {
          toast.error("Failed to load exam results")
          router.push("/study-assistant")
        }
      } catch (error) {
        console.error("Error fetching exam results:", error)
        toast.error("Failed to load exam results")
        router.push("/study-assistant")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      fetchResult()
    }
  }, [examId, router])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getQuestionAnswer = (questionId: string) => {
    return result?.studentAnswers.find(answer => answer.questionId === questionId)
  }

  const isCorrect = (questionId: string) => {
    const answer = getQuestionAnswer(questionId)
    return answer?.isCorrect || false
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Outstanding performance!"
    if (percentage >= 80) return "Great job! Well done!"
    if (percentage >= 70) return "Good work! Keep it up!"
    if (percentage >= 60) return "Not bad, but there's room for improvement."
    return "Keep studying and practicing to improve your score."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading results...</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Results not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The exam results you&apos;re looking for don&apos;t exist or you don&apos;t have access to them.
          </p>
          <Button onClick={() => router.push("/study-assistant")}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  const correctAnswers = result.studentAnswers.filter(answer => answer.isCorrect).length
  const totalQuestions = result.questions.length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Exam Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{result.title}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/study-assistant")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Score Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {result.percentage}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(result.percentage)}`}>
              {result.percentage >= 70 ? "🎉" : "📚"}
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {getPerformanceMessage(result.percentage).replace(/'/g, "&apos;")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(result.timeSpent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{result.subject}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Subject</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{totalQuestions} questions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(result.completedAt)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatTime(result.duration * 60)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Question Review</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              {showExplanations ? "Hide" : "Show"} Explanations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {result.questions.map((question, index) => {
              const studentAnswer = getQuestionAnswer(question.id)
              const correct = isCorrect(question.id)

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                      <Badge variant={correct ? "default" : "destructive"}>
                        {correct ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    {correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="text-gray-900 dark:text-white mb-4">
                    {question.question}
                  </div>

                  {question.type === "multiple-choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            option === question.correctAnswer
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : option === studentAnswer?.answer
                              ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && (
                            <CheckCircle className="h-4 w-4 inline ml-2" />
                          )}
                          {option === studentAnswer?.answer && option !== question.correctAnswer && (
                            <XCircle className="h-4 w-4 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "true-false" && (
                    <div className="space-y-2">
                      <div
                        className={`p-2 rounded ${
                          question.correctAnswer === true
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        True
                        {question.correctAnswer === true && (
                          <CheckCircle className="h-4 w-4 inline ml-2" />
                        )}
                      </div>
                      <div
                        className={`p-2 rounded ${
                          question.correctAnswer === false
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        False
                        {question.correctAnswer === false && (
                          <CheckCircle className="h-4 w-4 inline ml-2" />
                        )}
                      </div>
                    </div>
                  )}

                  {question.type === "short-answer" && (
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Your Answer:</div>
                        <div className="text-gray-900 dark:text-white">
                          {studentAnswer?.answer || "No answer provided"}
                        </div>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                        <div className="text-sm text-green-600 dark:text-green-400">Correct Answer:</div>
                        <div className="text-green-800 dark:text-green-200">
                          {question.correctAnswer}
                        </div>
                      </div>
                    </div>
                  )}

                  {showExplanations && question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Explanation:
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 