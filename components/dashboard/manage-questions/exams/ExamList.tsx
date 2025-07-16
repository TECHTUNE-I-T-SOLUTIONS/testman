"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar, BookOpen, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ToggleExamStatus from "./ToggleExamStatus"

interface Exam {
  _id: string
  title: string
  duration: number
  isActive: boolean
  courseId: { _id: string; name: string }
  scheduledTime?: string
}

interface ExamListProps {
  selectedCourseId: string
}

export default function ExamList({ selectedCourseId }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedCourseId) return

    const fetchExams = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching exams for courseId:", selectedCourseId)

        const response = await fetch(`/api/exams/admin?courseId=${selectedCourseId}`, { cache: "no-store" })

        if (!response.ok) throw new Error("Failed to fetch exams")

        const result = await response.json()
        console.log("API Response:", result)

        if (Array.isArray(result?.data)) {
          setExams(result.data)
        } else {
          throw new Error("Unexpected API response format")
        }
      } catch (error) {
        console.error("Error fetching exams:", error)
        setError("Failed to load exams. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [selectedCourseId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Exams Found</h3>
            <p className="text-muted-foreground max-w-md mt-2">No examinations are available for this course yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Examinations
        </CardTitle>
        <CardDescription>
          {exams.length} examination{exams.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exams.map((exam) => (
          <Card key={exam._id} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{exam.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{exam.duration} minutes</span>
                  </div>

                  {exam.scheduledTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(exam.scheduledTime).toLocaleString()}</span>
                    </div>
                  )}

                  <Badge variant={exam.isActive ? "default" : "secondary"}>
                    {exam.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex-shrink-0">
                  <ToggleExamStatus exam={exam} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
