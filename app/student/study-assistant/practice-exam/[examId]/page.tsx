"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, ArrowLeft, Brain, Clock, Trophy, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  correctAnswer: string | number | boolean
  explanation?: string
  points: number
}

interface PracticeExam {
  _id: string
  title: string
  subject?: string
  questions: Question[]
  duration: number
  status: "draft" | "active" | "completed" | "expired"
  studentAnswers?: Array<{
    questionId: string
    answer: string | number | boolean
  }>
  score?: number
  percentage?: number
  timeSpent?: number
  startedAt?: string
  completedAt?: string
}

interface ExamResults {
  percentage: number
  correctAnswers: number
  totalQuestions: number
}

export default function PracticeExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const [exam, setExam] = useState<PracticeExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<ExamResults | null>(null)

  const fetchExam = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/practice-exam?examId=${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data.exam)
        setTimeLeft(data.exam.duration * 60) // Convert minutes to seconds
        setExamCompleted(data.exam.status === "completed")

        if (data.exam.studentAnswers) {
          const answersMap: Record<string, string | number | boolean> = {}
          data.exam.studentAnswers.forEach((answer: { questionId: string; answer: string | number | boolean }) => {
            answersMap[answer.questionId] = answer.answer
          })
          setAnswers(answersMap)
        }
      } else {
        toast.error("Failed to load exam")
        router.back()
      }
    } catch (error) {
      console.error("Error fetching exam:", error)
      toast.error("Error loading exam")
      router.back()
    } finally {
      setLoading(false)
    }
  }, [examId, router])

  useEffect(() => {
    fetchExam()
  }, [fetchExam])

  const startExam = useCallback(() => {
    setExamStarted(true)
    toast.success("Exam started! Good luck!")
  }, [])

  const submitExam = useCallback(async () => {
    if (!exam) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/ai/practice-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam._id,
          answers,
          timeSpent: exam.duration * 60 - timeLeft,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setExamCompleted(true)
        toast.success("Exam submitted successfully!")
      } else {
        toast.error("Failed to submit exam")
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast.error("Error submitting exam")
    } finally {
      setSubmitting(false)
      setShowSubmitDialog(false)
    }
  }, [exam, answers, timeLeft])

  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          submitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, examCompleted, timeLeft, submitExam])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const isAnswerCorrect = (question: Question, studentAnswer: string | number | boolean) => {
    if (!examCompleted) return null

    switch (question.type) {
      case "multiple-choice":
        return Number.parseInt(studentAnswer.toString()) === question.correctAnswer
      case "true-false":
        return studentAnswer === question.correctAnswer
      case "short-answer":
        return (
          studentAnswer?.toString().toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim()
        )
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-lg">Loading your practice exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-gray-600 mb-4">The requested practice exam could not be found.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <p className="text-sm text-gray-600">
                  {exam.questions.length} questions • {exam.duration} minutes
                  {exam.subject && ` • ${exam.subject}`}
                </p>
              </div>
            </div>

            {examStarted && !examCompleted && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Time Remaining</div>
                  <div className={`text-lg font-mono font-bold ${timeLeft < 300 ? "text-red-600" : "text-green-600"}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={getAnsweredCount() === 0}
                >
                  Submit Exam
                </Button>
              </div>
            )}

            {examCompleted && results && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Final Score</div>
                <div className="text-2xl font-bold text-green-600">{results.percentage}%</div>
                <div className="text-sm text-gray-600">
                  {results.correctAnswers}/{results.totalQuestions} correct
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {!examStarted && !examCompleted ? (
          // Pre-exam screen
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Start?</CardTitle>
              <CardDescription>
                You have {exam.duration} minutes to complete {exam.questions.length} questions. Make sure you have a
                stable internet connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Exam Instructions:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Answer all questions to the best of your ability</li>
                  <li>• You can navigate between questions freely</li>
                  <li>• The exam will auto-submit when time runs out</li>
                  <li>• Make sure to submit before the timer reaches zero</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{exam.questions.length}</div>
                  <div className="text-sm text-blue-700">Questions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{exam.duration}</div>
                  <div className="text-sm text-green-700">Minutes</div>
                </div>
              </div>

              <Button onClick={startExam} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Start Exam
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Exam interface
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Question Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Questions</CardTitle>
                  <CardDescription>
                    {getAnsweredCount()}/{exam.questions.length} answered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                    {exam.questions.map((question, index) => {
                      const isAnswered = answers[question.id] !== undefined
                      const isCurrent = index === currentQuestionIndex
                      const isCorrect = examCompleted ? isAnswerCorrect(question, answers[question.id]) : null

                      return (
                        <Button
                          key={question.id}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`relative ${
                            examCompleted
                              ? isCorrect === true
                                ? "border-green-500 bg-green-50 hover:bg-green-100"
                                : isCorrect === false
                                  ? "border-red-500 bg-red-50 hover:bg-red-100"
                                  : ""
                              : isAnswered
                                ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                                : ""
                          }`}
                        >
                          {index + 1}
                          {examCompleted && (
                            <div className="absolute -top-1 -right-1">
                              {isCorrect === true ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : isCorrect === false ? (
                                <XCircle className="h-3 w-3 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </Button>
                      )
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Question Area */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Question {currentQuestionIndex + 1} of {exam.questions.length}
                    </CardTitle>
                    <Badge variant="outline">
                      {currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-4">
                    {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                      <RadioGroup
                        value={answers[currentQuestion.id]?.toString() || ""}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, Number.parseInt(value))}
                        disabled={examCompleted}
                      >
                        {currentQuestion.options.map((option, index) => {
                          const isSelected = answers[currentQuestion.id] === index
                          const isCorrect = examCompleted && index === currentQuestion.correctAnswer
                          const isWrong = examCompleted && isSelected && index !== currentQuestion.correctAnswer

                          return (
                            <div
                              key={index}
                              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                                examCompleted
                                  ? isCorrect
                                    ? "border-green-500 bg-green-50"
                                    : isWrong
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200"
                                  : isSelected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                              {examCompleted && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {examCompleted && isWrong && <XCircle className="h-5 w-5 text-red-600" />}
                            </div>
                          )
                        })}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "true-false" && (
                      <RadioGroup
                        value={answers[currentQuestion.id]?.toString() || ""}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === "true")}
                        disabled={examCompleted}
                      >
                        {[
                          { value: "true", label: "True" },
                          { value: "false", label: "False" },
                        ].map((option) => {
                          const isSelected = answers[currentQuestion.id]?.toString() === option.value
                          const isCorrect = examCompleted && (option.value === "true") === currentQuestion.correctAnswer
                          const isWrong =
                            examCompleted && isSelected && (option.value === "true") !== currentQuestion.correctAnswer

                          return (
                            <div
                              key={option.value}
                              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                                examCompleted
                                  ? isCorrect
                                    ? "border-green-500 bg-green-50"
                                    : isWrong
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200"
                                  : isSelected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <RadioGroupItem value={option.value} id={`tf-${option.value}`} />
                              <Label htmlFor={`tf-${option.value}`} className="flex-1 cursor-pointer">
                                {option.label}
                              </Label>
                              {examCompleted && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {examCompleted && isWrong && <XCircle className="h-5 w-5 text-red-600" />}
                            </div>
                          )
                        })}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "short-answer" && (
                      <div className="space-y-2">
                        <Label htmlFor="short-answer">Your Answer:</Label>
                        <Textarea
                          id="short-answer"
                          value={answers[currentQuestion.id]?.toString() || ""}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          placeholder="Type your answer here..."
                          disabled={examCompleted}
                          className={
                            examCompleted
                              ? isAnswerCorrect(currentQuestion, answers[currentQuestion.id])
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : ""
                          }
                        />
                        {examCompleted && (
                          <div className="text-sm">
                            <span className="font-medium">Correct Answer: </span>
                            <span className="text-green-600">{currentQuestion.correctAnswer?.toString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Explanation (shown after completion) */}
                  {examCompleted && currentQuestion.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>

                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))
                      }
                      disabled={currentQuestionIndex === exam.questions.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Submit Exam
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of{" "}
              {exam.questions.length} questions.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                Once submitted, you cannot make any changes to your answers. Make sure you have reviewed all questions.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={submitExam} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}