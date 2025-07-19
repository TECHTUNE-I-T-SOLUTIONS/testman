"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Play,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BookOpen,
  Clock,
  FileText,
  Target,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AIPracticeExam {
  id: string
  title: string
  subject: string
  questionsCount: number
  duration: number
  status: "draft" | "active" | "completed" | "expired"
  score?: number
  percentage?: number
  createdAt: string
  completedAt?: string
  startedAt?: string
}

interface PracticeExamsTabProps {
  exams: AIPracticeExam[]
  loading: boolean
  onExamDeleted: () => void
  onRefresh: () => void
}

export function PracticeExamsTab({
  exams,
  loading,
  onExamDeleted,
  onRefresh,
}: PracticeExamsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()

  const filteredAndSortedExams = useMemo(() => {
    const filtered = exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || exam.status === statusFilter
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "subject":
          aValue = a.subject.toLowerCase()
          bValue = b.subject.toLowerCase()
          break
        case "questionsCount":
          aValue = a.questionsCount
          bValue = b.questionsCount
          break
        case "duration":
          aValue = a.duration
          bValue = b.duration
          break
        case "score":
          aValue = a.score || 0
          bValue = b.score || 0
          break
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [exams, searchTerm, statusFilter, sortBy, sortOrder])

  const handleDeleteExam = async (examId: string) => {
    try {
      const response = await fetch("/api/ai/practice-exam", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      })

      if (response.ok) {
        toast.success("Exam deleted successfully")
        onExamDeleted()
      } else {
        throw new Error("Failed to delete exam")
      }
    } catch (error) {
      console.error("Error deleting exam:", error)
      toast.error("Failed to delete exam")
    }
  }

  const handleTakeExam = (examId: string) => {
    router.push(`/study-assistant/exams/${examId}/take`)
  }

  const handleViewResults = (examId: string) => {
    router.push(`/study-assistant/results/${examId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading practice exams...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Exams</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-generated exams from your study materials
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
                <SelectItem value="questionsCount">Questions</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {filteredAndSortedExams.length} Exam{filteredAndSortedExams.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {filteredAndSortedExams.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No practice exams found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {exams.length === 0
                    ? "Upload documents in the chat to generate practice exams"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {exam.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {exam.subject}
                      </p>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(exam.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Exam Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {exam.questionsCount} questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDuration(exam.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Score Display */}
                  {exam.score !== undefined && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Score: {exam.score}%
                      </span>
                      {exam.score >= 70 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(exam.createdAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {exam.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => handleTakeExam(exam.id)}
                        className="flex items-center gap-1 flex-1"
                      >
                        <Play className="h-3 w-3" />
                        Take Exam
                      </Button>
                    )}
                    {exam.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewResults(exam.id)}
                        className="flex items-center gap-1 flex-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Results
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Practice Exam</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{exam.title}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExam(exam.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 