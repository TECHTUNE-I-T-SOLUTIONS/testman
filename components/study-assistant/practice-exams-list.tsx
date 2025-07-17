"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Play, CheckCircle2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
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

interface PracticeExam {
  id: string
  title: string
  subject: string
  questionsCount: number
  duration: number
  status: string
  score?: number
  percentage?: number
  createdAt: string
  completedAt?: string
  startedAt?: string
}

interface PracticeExamsListProps {
  exams: PracticeExam[]
  onRefresh: () => void
  isGenerating: boolean
}

export function PracticeExamsList({ exams, onRefresh, isGenerating }: PracticeExamsListProps) {
  const { toast } = useToast()

  const handleDeleteExam = async (examId: string) => {
    try {
      const response = await fetch("/api/ai/practice-exam", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete exam.")
      }

      toast({
        title: "Exam Deleted",
        description: "The practice exam has been successfully deleted.",
        variant: "default",
      })
      onRefresh() // Refresh the list after deletion
    } catch (error: unknown) {
      console.error("Error deleting exam:", error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Could not delete the practice exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Your Practice Exams</CardTitle>
        <Button onClick={onRefresh} variant="ghost" size="icon" disabled={isGenerating}>
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Refresh Exams</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isGenerating && (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Generating new exam...</span>
          </div>
        )}
        {exams.length === 0 && !isGenerating ? (
          <CardDescription className="text-center py-8">
            No practice exams generated yet. Upload some study materials and click &quot;Generate Practice Exam&quot; to get
            started!
          </CardDescription>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exam.subject} &bull; {exam.questionsCount} Questions &bull; {exam.duration} mins
                  </p>
                  {exam.status === "completed" && exam.percentage !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Score: {exam.score}/{exam.questionsCount} ({exam.percentage}%)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {exam.status === "active" && (
                    <Link href={`/student/study-assistant/practice-exam/${exam.id}`}>
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" /> Start Exam
                      </Button>
                    </Link>
                  )}
                  {exam.status === "completed" && (
                    <Link href={`/student/study-assistant/practice-exam/${exam.id}?review=true`}>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Review Results
                      </Button>
                    </Link>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Exam</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your practice exam and remove its
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteExam(exam.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}