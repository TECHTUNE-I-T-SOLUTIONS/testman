"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Clock, AlertCircle, CheckCircle, HelpCircle, ArrowLeft, Send, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type Exam = {
  _id: string
  title: string
  description?: string
  duration: number
  questions: {
    _id: string
    id: string
    questionText: string
    options: Options[]
  }[]
}

type Options = {
  text: string
}

export default function AttemptExam() {
  const params = useParams()
  const searchParams = useSearchParams()
  const examId = params.id
  const courseId = searchParams.get("courseId")
  const { toast } = useToast()

  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Calculate progress
  const progress = exam ? Math.round((Object.keys(answers).length / exam.questions.length) * 100) : 0

  // Time formatting
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--:--"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (!timeLeft || !exam) return "text-primary"

    const totalSeconds = exam.duration * 60
    const percentLeft = (timeLeft / totalSeconds) * 100

    if (percentLeft < 10) return "text-destructive animate-pulse"
    if (percentLeft < 25) return "text-amber-500"
    return "text-primary"
  }

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        if (!examId || !courseId) return
        setLoading(true)

        const response = await fetch(`/api/exams?examId=${examId}&courseId=${courseId}`)
        if (!response.ok) throw new Error("Failed to fetch exam")

        const data: Exam = await response.json()
        setExam(data)

        const storedStartTime = localStorage.getItem(`exam_start_${examId}`)
        const now = Date.now()

        if (storedStartTime) {
          const elapsedTime = Math.floor((now - Number.parseInt(storedStartTime)) / 1000)
          const remainingTime = data.duration * 60 - elapsedTime
          setTimeLeft(remainingTime > 0 ? remainingTime : 0)
        } else {
          localStorage.setItem(`exam_start_${examId}`, now.toString())
          setTimeLeft(data.duration * 60)
        }
      } catch (error) {
        console.error("Error fetching exam:", error)
        setError("Failed to load exam. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId, courseId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev ? prev - 1 : 0
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft])

  // Auto-submit when time expires
  useEffect(() => {
    if (timeLeft === 0) {
      toast({
        title: "Time's up!",
        description: "Your exam is being submitted automatically.",
        variant: "destructive",
      })

      handleSubmit(true)
    }
  }, [timeLeft])

  // Handle option selection
  const handleOptionChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }))
  }

  // Navigate to next/previous question
  const goToNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Jump to specific question
  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  // Submit exam
  const handleSubmit = async (isAutoSubmit = false) => {
    if (!exam || submitting) return

    if (!isAutoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true)
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!res.ok) throw new Error("Failed to submit exam")

      toast({
        title: "Success!",
        description: "Your exam has been submitted successfully.",
        variant: "default",
      })

      // Clear exam data from localStorage
      localStorage.removeItem(`exam_start_${examId}`)

      // Redirect to results page
      router.push("/student/results")
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your exam. Please try again.",
        variant: "destructive",
      })
      setSubmitting(false)
      setShowConfirmSubmit(false)
    }
  }

  // Cancel submission confirmation
  const cancelSubmit = () => {
    setShowConfirmSubmit(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Exam not found state
  if (!exam) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested exam could not be found.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Current question
  const currentQuestion = exam.questions[currentQuestionIndex]
  const isAnswered = answers[currentQuestion._id] !== undefined
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription>{exam.description || "Answer all questions to complete the exam"}</CardDescription>
            </div>
            <div className={`text-xl font-mono font-bold ${getTimeColor()}`}>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Progress: {Object.keys(answers).length} of {exam.questions.length} questions answered
              </span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {exam.questions.map((q, idx) => (
              <Badge
                key={q._id}
                variant={answers[q._id] ? "default" : "outline"}
                className={`cursor-pointer hover:bg-primary/90 ${
                  currentQuestionIndex === idx ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => jumpToQuestion(idx)}
              >
                {idx + 1}
              </Badge>
            ))}
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <span>{currentQuestion.questionText}</span>
              </h3>
            </div>

            <RadioGroup
              value={answers[currentQuestion._id] || ""}
              onValueChange={(value) => handleOptionChange(currentQuestion._id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors ${
                    answers[currentQuestion._id] === option.text ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value={option.text} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer font-medium">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToPrevQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {!isLastQuestion ? (
              <Button onClick={goToNextQuestion} disabled={!isAnswered}>
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setShowConfirmSubmit(true)}
                disabled={Object.keys(answers).length !== exam.questions.length || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Exam
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </div>
        </CardFooter>
      </Card>

      {showConfirmSubmit && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Confirm Submission
            </CardTitle>
            <CardDescription>
              You are about to submit your exam. Please review your answers before confirming.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Questions answered:</span> {Object.keys(answers).length} of{" "}
                {exam.questions.length}
              </p>
              {Object.keys(answers).length < exam.questions.length && (
                <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    You have {exam.questions.length - Object.keys(answers).length} unanswered questions. Are you sure
                    you want to submit?
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button variant="outline" onClick={cancelSubmit}>
              Go Back
            </Button>
            <Button variant="default" onClick={() => handleSubmit()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Submission
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

