"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { BookOpen, Clock, Calendar, Plus, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import CourseDropdown from "@/components/dashboard/manage-questions/exams/CourseDropdown"
import QuestionSelection from "@/components/dashboard/manage-questions/exams/QuestionSelection"
import ScheduleExam from "@/components/dashboard/manage-questions/exams/ScheduleExam"
import ExamList from "@/components/dashboard/manage-questions/exams/ExamList"

interface ExamFormData {
  courseId: string
  title: string
  duration: number
  selectedQuestions: string[]
  scheduledTime?: string
}

export default function ExamForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExamFormData>({
    defaultValues: { selectedQuestions: [] },
  })

  const [isScheduling, setIsScheduling] = useState(false)
  const [loading, setLoading] = useState(false)
  const courseId = watch("courseId")

  const onSubmit = async (data: ExamFormData) => {
    const selectedQuestions = watch("selectedQuestions") || []
    const finalData = { ...data, selectedQuestions }

    console.log("Submitting Exam Data:", finalData)

    try {
      setLoading(true)
      const response = await fetch("/api/exams/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) throw new Error("Failed to create exam")

      toast.success("Exam created successfully!")
      reset()
    } catch (error) {
      console.error("Error creating exam:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Create Examination
          </h1>
          <p className="text-muted-foreground mt-1">Set up new examinations with questions and scheduling</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Exam Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Exam Details
              </CardTitle>
              <CardDescription>Configure the basic information for your examination</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <CourseDropdown register={register} />
                  {errors.courseId && <p className="text-sm text-destructive">Course is required.</p>}
                </div>

                {/* Exam Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Exam title is required" })}
                    placeholder="Enter exam title"
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      {...register("duration", {
                        required: "Duration is required",
                        min: { value: 1, message: "Minimum duration is 1 minute" },
                      })}
                      placeholder="Enter duration"
                      className="pl-10"
                    />
                  </div>
                  {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                </div>

                {/* Question Selection */}
                {courseId ? (
                  <QuestionSelection
                    courseId={courseId}
                    setValue={setValue}
                    selectedQuestions={watch("selectedQuestions")}
                  />
                ) : (
                  <Alert>
                    <AlertDescription>Select a course to load available questions.</AlertDescription>
                  </Alert>
                )}

                {/* Schedule Exam */}
                <ScheduleExam isScheduling={isScheduling} setIsScheduling={setIsScheduling} register={register} />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Creating..."
                  ) : isScheduling ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Exam
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Exam
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Exam List */}
        <div className="space-y-6">
          {courseId ? (
            <ExamList selectedCourseId={courseId} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <Alert>
                  <AlertDescription>Select a course to view existing examinations.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
