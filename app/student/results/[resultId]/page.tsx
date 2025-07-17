"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, FileText, Award, AlertCircle, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type ExamResultType = {
  course: string
  examTitle: string
  score: number
  totalQuestions: number
  createdAt: string
  answers: {
    question: string
    studentAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }[]
}

type AnswerType = {
  question: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export default function ExamResult() {
  const { resultId } = useParams() as { resultId?: string }
  const router = useRouter()
  const [result, setResult] = useState<ExamResultType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resultId) return

    setLoading(true)
    fetch(`/api/results/${resultId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results")
        return res.json()
      })
      .then((data) => {
        const formattedData: ExamResultType = {
          course: data.course,
          examTitle: data.examTitle,
          score: data.score,
          totalQuestions: data.totalQuestions,
          createdAt: data.createdAt,
          answers: data.answers.map((a: AnswerType) => ({
            question: a.question,
            studentAnswer: a.studentAnswer,
            correctAnswer: a.correctAnswer,
            isCorrect: a.isCorrect,
          })),
        }
        setResult(formattedData)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [resultId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result details...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Result Not Found</h3>
        <p className="text-gray-600 mb-4">The exam result you&apos;re looking for could not be found.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const percentage = (result.score / result.totalQuestions) * 100
  const formattedPercentage = Number.parseFloat(percentage.toFixed(1))

  const getScoreStatus = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: "Excellent",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <Award className="h-5 w-5" />,
      }
    } else if (percentage >= 70) {
      return {
        label: "Good",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Award className="h-5 w-5" />,
      }
    } else if (percentage >= 50) {
      return {
        label: "Average",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <Award className="h-5 w-5" />,
      }
    } else {
      return {
        label: "Needs Improvement",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <AlertCircle className="h-5 w-5" />,
      }
    }
  }

  const scoreStatus = getScoreStatus(formattedPercentage)
  const correctAnswers = result.answers.filter((a) => a.isCorrect).length
  const incorrectAnswers = result.answers.filter((a) => !a.isCorrect).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="border-gray-200">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Result Details</h1>
          <p className="text-gray-600">Detailed breakdown of your exam performance</p>
        </div>
      </div>

      {/* Result Summary */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-gray-900 mb-2">{result.examTitle}</CardTitle>
              <CardDescription className="text-gray-600">{result.course}</CardDescription>
            </div>
            <Badge variant="outline" className={`${scoreStatus.color} px-3 py-1`}>
              <div className="flex items-center gap-2">
                {scoreStatus.icon}
                <span className="font-medium">{scoreStatus.label}</span>
              </div>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {result.score}/{result.totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">{formattedPercentage}%</div>
              <p className="text-sm text-gray-600">Percentage</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {new Date(result.createdAt).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-600">Date Taken</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Score Percentage</span>
              <span className="text-sm font-medium text-gray-900">{formattedPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  formattedPercentage >= 80
                    ? "bg-green-500"
                    : formattedPercentage >= 70
                      ? "bg-blue-500"
                      : formattedPercentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                }`}
                style={{ width: `${formattedPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Answer Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">{correctAnswers} Correct</div>
                <div className="text-sm text-green-700">Well done!</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">{incorrectAnswers} Incorrect</div>
                <div className="text-sm text-red-700">Review these topics</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Breakdown
          </CardTitle>
          <CardDescription>Review each question and your answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.answers.map((answer, index) => (
            <div key={index}>
              <Card
                className={`border-l-4 ${answer.isCorrect ? "border-l-green-500 bg-green-50/30" : "border-l-red-500 bg-red-50/30"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-medium text-gray-900">Question {index + 1}</CardTitle>
                    <Badge variant={answer.isCorrect ? "default" : "destructive"} className="ml-2">
                      {answer.isCorrect ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Incorrect
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{answer.question}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Your Answer:</span>
                      <span className={`text-sm ${answer.isCorrect ? "text-green-700" : "text-red-700"} font-medium`}>
                        {answer.studentAnswer}
                      </span>
                    </div>
                    {!answer.isCorrect && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">Correct Answer:</span>
                        <span className="text-sm text-green-700 font-medium">{answer.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {index < result.answers.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}