"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Play,
} from "lucide-react"
import { toast } from "sonner"
import { AnalogClock } from "@/components/study-assistant/analog-clock"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  correctAnswer: string | boolean | string[]
  explanation?: string
  points: number
}

interface Exam {
  id: string
  title: string
  subject: string
  questions: Question[]
  duration: number
  status: string
}

interface StudentAnswer {
  questionId: string
  answer: string | boolean | string[]
  timeSpent: number
}

export default function TakeExam() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/ai/practice-exam?examId=${examId}`)
        if (response.ok) {
          const data = await response.json()
          setExam(data.exam)
          setTimeRemaining(data.exam.duration * 60) // Convert minutes to seconds
        } else {
          toast.error("Failed to load exam")
          router.push("/study-assistant")
        }
      } catch (error) {
        console.error("Error fetching exam:", error)
        toast.error("Failed to load exam")
        router.push("/study-assistant")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      fetchExam()
    }
  }, [examId, router])

  // Timer effect - non-pausable
  useEffect(() => {
    if (!isStarted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, timeRemaining])

  const handleStartExam = () => {
    setIsStarted(true)
    toast.success("Exam started! Good luck!")
  }

  const handleAnswerChange = (questionId: string, answer: string | boolean | string[]) => {
    const startTime = answers[questionId]?.timeSpent || 0
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timeSpent: startTime
      }
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (exam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitExam = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/ai/practice-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          answers: Object.values(answers),
          timeSpent: (exam?.duration || 0) * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        toast.success("Exam submitted successfully!")
        router.push(`/study-assistant/results/${examId}`)
      } else {
        throw new Error("Failed to submit exam")
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast.error("Failed to submit exam")
    } finally {
      setSubmitting(false)
    }
  }

  const currentQuestion = exam?.questions[currentQuestionIndex]
  const progress = exam ? ((currentQuestionIndex + 1) / exam.questions.length) * 100 : 0
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading exam...</span>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Exam not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The exam you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/study-assistant")}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {exam.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {exam.questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {exam.duration}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Instructions:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Read each question carefully before answering</li>
                <li>• You can navigate between questions using the navigation buttons</li>
                <li>• The timer will automatically submit your exam when time runs out</li>
                <li>• The timer cannot be paused - use your time wisely</li>
                <li>• Make sure to review all questions before submitting</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/study-assistant")}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleStartExam} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {exam.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{exam.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          <AnalogClock timeRemaining={timeRemaining} size={100} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount} answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion.type === "multiple-choice" ? "Multiple Choice" :
                 currentQuestion.type === "true-false" ? "True/False" : "Short Answer"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg text-gray-900 dark:text-white">
              {currentQuestion.question}
            </div>

            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]?.answer as string || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "true-false" && (
              <RadioGroup
                value={answers[currentQuestion.id]?.answer as string || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="text-base cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="text-base cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "short-answer" && (
              <Textarea
                placeholder="Enter your answer here..."
                value={answers[currentQuestion.id]?.answer as string || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="min-h-[120px]"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Flag className="h-4 w-4 mr-2" />
                Submit Exam
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Exam</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit your exam? You have answered {answeredCount} out of {exam.questions.length} questions.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitting ? "Submitting..." : "Submit Exam"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === exam.questions.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Question Navigation */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Question Navigation
        </h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {exam.questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={`h-8 w-8 p-0 ${
                answers[exam.questions[index].id] ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 