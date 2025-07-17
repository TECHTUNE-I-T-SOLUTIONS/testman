
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCcw, Play, CheckCircle2, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(exams.map(exam => exam.subject))]
    return subjects.filter(Boolean)
  }, [exams])

  // Filter and sort exams
  const filteredAndSortedExams = useMemo(() => {
    let filtered = exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || exam.status === statusFilter
      const matchesSubject = subjectFilter === "all" || exam.subject === subjectFilter
      
      return matchesSearch && matchesStatus && matchesSubject
    })

    // Sort exams
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof PracticeExam]
      let bValue: any = b[sortBy as keyof PracticeExam]

      if (sortBy === "createdAt" || sortBy === "completedAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [exams, searchQuery, statusFilter, subjectFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExams.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExams = filteredAndSortedExams.slice(startIndex, startIndex + itemsPerPage)

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
      onRefresh()
    } catch (error: unknown) {
      console.error("Error deleting exam:", error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Could not delete the practice exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Your Practice Exams ({filteredAndSortedExams.length})</CardTitle>
        <Button onClick={onRefresh} variant="ghost" size="icon" disabled={isGenerating}>
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Refresh Exams</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as "asc" | "desc")
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="subject-asc">Subject A-Z</SelectItem>
                  <SelectItem value="questionsCount-desc">Most Questions</SelectItem>
                  <SelectItem value="duration-desc">Longest Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Generating new exam...</span>
          </div>
        )}

        {filteredAndSortedExams.length === 0 && !isGenerating ? (
          <CardDescription className="text-center py-8">
            {searchQuery || statusFilter !== "all" || subjectFilter !== "all" 
              ? "No practice exams match your current filters."
              : "No practice exams generated yet. Upload some study materials and click \"Generate Practice Exam\" to get started!"
            }
          </CardDescription>
        ) : (
          <>
            <div className="grid gap-4">
              {paginatedExams.map((exam) => (
                <Card key={exam.id} className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.subject} &bull; {exam.questionsCount} Questions &bull; {exam.duration} mins
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {formatDate(exam.createdAt)}
                    </p>
                    {exam.status === "completed" && exam.percentage !== undefined && (
                      <p className="text-sm text-green-600 dark:text-green-400">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedExams.length)} of {filteredAndSortedExams.length} exams
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-muted-foreground px-1">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
