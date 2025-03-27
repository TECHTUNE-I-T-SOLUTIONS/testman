"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Calendar, Clock, AlertCircle, BookOpen, CheckCircle, ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Exam {
  _id: string
  title: string
  description?: string
  duration: number
  isActive: boolean
  scheduledTime?: string
  totalQuestions?: number
  passingScore?: number
}

export default function StudentExamList() {
  const params = useParams()
  const courseId = params.id
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [courseName, setCourseName] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    if (!courseId) return

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        if (response.ok) {
          const data = await response.json()
          setCourseName(data.name || "Course")
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
      }
    }

    const fetchExams = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/exams?courseId=${courseId}`)
        if (!response.ok) throw new Error("Failed to fetch exams")

        const result = await response.json()

        // For demo purposes, let's enhance the data with some additional fields
        const enhancedExams = Array.isArray(result)
          ? result.map((exam) => ({
              ...exam,
              description: exam.description || "This exam will test your knowledge on the course material.",
              totalQuestions: exam.totalQuestions || Math.floor(Math.random() * 20) + 10,
              passingScore: exam.passingScore || 60,
            }))
          : []

        setExams(enhancedExams)
      } catch (error) {
        console.error("Error fetching exams:", error)
        setError("Failed to load exams. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
    fetchExams()
  }, [courseId])

  const formatDate = (dateString?: string) => {
    if (!dateString) return null

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date)
    } catch (e) {
      console.log(e)
      return dateString
    }
  }

  const getStatusBadge = (exam: Exam) => {
    if (!exam.isActive) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      )
    }

    if (exam.scheduledTime) {
      const scheduledDate = new Date(exam.scheduledTime)
      const now = new Date()

      if (scheduledDate > now) {
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Scheduled
          </Badge>
        )
      }
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        Available
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8 text-center">
        <BookOpen className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
        <p className="text-muted-foreground mt-1">Available examinations for this course</p>
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-muted/30">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : exams.length === 0 ? (
        <Card className="max-w-2xl mx-auto border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Exams Available</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              There are currently no exams available for this course. Please check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto grid gap-6">
          {exams.map((exam) => (
            <Card key={exam._id} className="overflow-hidden transition-all duration-300 hover:shadow-md group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </div>
                  {getStatusBadge(exam)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      Duration: <span className="font-medium text-foreground">{exam.duration} minutes</span>
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      Questions: <span className="font-medium text-foreground">{exam.totalQuestions}</span>
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      Passing Score: <span className="font-medium text-foreground">{exam.passingScore}%</span>
                    </span>
                  </div>
                </div>

                {exam.scheduledTime && (
                  <div className="mt-4 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">
                      Scheduled for:{" "}
                      <span className="font-medium text-foreground">{formatDate(exam.scheduledTime)}</span>
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm text-muted-foreground">
                    {exam.isActive
                      ? "You can start this exam now or at the scheduled time."
                      : "This exam is currently not available."}
                  </p>
                  <Button
                    onClick={() => router.push(`/student/exams/${exam._id}/take?courseId=${courseId}`)}
                    disabled={!exam.isActive}
                    className="transition-all duration-300 group-hover:translate-x-1"
                  >
                    Start Exam
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

