"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Search, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  Users, 
  FileText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import Header from "@/components/dashboard/Header"

interface AIExam {
  _id: string
  title: string
  courseId?: {
    _id: string
    name: string
  } | null
  studentId?: {
    _id: string
    name: string
    matricNumber: string
  } | null
  questions: Array<{
    id: string
    question: string
    type: "multiple-choice" | "true-false" | "short-answer"
    options?: string[]
    correctAnswer: string | boolean | string[]
    explanation?: string
    points: number
  }>
  studentAnswers?: Array<{
    questionId: string
    answer: string | boolean | string[]
    isCorrect: boolean
    timeSpent: number
  }>
  totalQuestions: number
  duration: number
  isActive: boolean
  createdAt: string
  takenCount: number
  averageScore: number
  subject?: string
  score?: number
  percentage?: number
  timeSpent?: number
  completedAt?: string
}

const ITEMS_PER_PAGE = 12

export default function AIExamsPage() {
  const [exams, setExams] = useState<AIExam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedExam, setSelectedExam] = useState<AIExam | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editExam, setEditExam] = useState<AIExam | null>(null)
  // Update editForm type
  const [editForm, setEditForm] = useState<{ title: string; duration: number; questions: { id: string; question: string; type: "multiple-choice" | "true-false" | "short-answer"; options?: string[]; correctAnswer: string | boolean | string[]; explanation?: string; points: number }[] }>({ title: '', duration: 0, questions: [] })
  const [questionPage, setQuestionPage] = useState(1)
  const questionsPerPage = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 20

  useEffect(() => {
    fetchAIExams()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter])

  const fetchAIExams = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/ai-exams?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}&status=${statusFilter}`
      )
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams)
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE))
      } else {
        throw new Error('Failed to fetch AI exams')
      }
    } catch (error) {
      console.error('Error fetching AI exams:', error)
      toast.error('Failed to load AI exams')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async () => {
    if (!selectedExam) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/ai-exams/${selectedExam._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('AI exam deleted successfully')
        setShowDeleteModal(false)
        setSelectedExam(null)
        fetchAIExams()
      } else {
        throw new Error('Failed to delete exam')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      toast.error('Failed to delete exam')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (examId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/ai-exams/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        toast.success(`Exam ${!isActive ? 'activated' : 'deactivated'}`)
        fetchAIExams()
      } else {
        throw new Error('Failed to update exam status')
      }
    } catch (error) {
      console.error('Error updating exam status:', error)
      toast.error('Failed to update exam status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  if (loading && exams.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="AI Exams Management" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading AI exams...</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total attempts and avg score safely
  const totalAttempts = exams.reduce((sum, exam) => sum + (Array.isArray(exam.studentAnswers) && exam.studentAnswers.length > 0 ? 1 : 0), 0)
  const avgScore = exams.length > 0 ? Math.round(exams.reduce((sum, exam) => sum + (typeof exam.percentage === 'number' ? exam.percentage : 0), 0) / exams.length) : 0

  return (
    <div className="min-h-screen bg-background">
      <Header title="AI Exams Management" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI-Generated Exams</h1>
            <p className="text-muted-foreground">Manage exams created by Alex AI for students</p>
          </div>
          <Button 
            onClick={fetchAIExams} 
            disabled={loading}
            className="border-border bg-background text-foreground hover:bg-muted"
          >
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Exams</p>
                  <p className="text-2xl font-bold text-foreground">{exams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Exams</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {exams.filter(exam => exam.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalAttempts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {avgScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by exam title, course, or student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {exams.length} AI exams
          </p>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || statusFilter !== "all" ? "No exams found" : "No AI exams available"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or clear the filters to see all exams."
                  : "There are currently no AI-generated exams in the system."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exams.map((exam) => (
              <Card 
                key={exam._id} 
                className={`transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-card/80 ${
                  !exam.isActive ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                            {exam.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {exam.courseId?.name || "Unknown Course"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {exam.studentId?.name || "Unknown Student"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {exam.totalQuestions} questions
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {exam.duration}min
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {exam.takenCount} taken
                        </span>
                      </div>
                    </div>

                    {/* Average Score */}
                    {exam.takenCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Avg Score:</span>
                        <span className={`font-medium ${getScoreColor(exam.averageScore)}`}>
                          {exam.averageScore.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="pt-2">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(exam.isActive)}
                      >
                        {exam.isActive ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Created: {formatDate(exam.createdAt)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border bg-background text-foreground hover:bg-muted"
                        onClick={() => handleToggleStatus(exam._id, exam.isActive)}
                      >
                        {exam.isActive ? (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-background text-foreground hover:bg-muted"
                        onClick={() => { setSelectedExam(exam); setShowViewModal(true); }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-background text-foreground hover:bg-muted"
                        onClick={() => {
                          setSelectedExam(exam)
                          setShowDeleteModal(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button onClick={() => { setEditExam(exam); setEditForm({ title: exam.title, duration: exam.duration, questions: exam.questions }); setShowEditModal(true); }} variant="secondary" size="sm" className="ml-2">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="border-border text-foreground hover:bg-muted"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-sm text-muted-foreground">
                ({exams.length} exams)
              </span>
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="border-border text-foreground hover:bg-muted"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete <strong className="text-foreground">{selectedExam?.title}</strong>? 
                This action cannot be undone and will permanently remove the AI exam and all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteExam}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Exam
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Exam Details Modal */}
        <Dialog open={showViewModal && !!selectedExam} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-full sm:max-w-3xl w-full p-2 sm:p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <DialogHeader>
              <DialogTitle>Exam Details</DialogTitle>
              <DialogDescription>Full details of the AI-generated exam for any student</DialogDescription>
            </DialogHeader>
            {selectedExam && (
              <><div className="space-y-4 flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold">Title:</span> {selectedExam.title}</div>
                <div><span className="font-semibold">Subject:</span> {selectedExam.subject || "-"}</div>
                <div><span className="font-semibold">Course:</span> {selectedExam.courseId?.name || "Unknown Course"}</div>
                <div><span className="font-semibold">Student:</span> {selectedExam.studentId?.name || "Unknown Student"} {selectedExam.studentId?.matricNumber ? `(${selectedExam.studentId.matricNumber})` : null}</div>
                <div><span className="font-semibold">Questions:</span> {selectedExam.questions?.length ?? 0}</div>
                <div><span className="font-semibold">Duration:</span> {selectedExam.duration} min</div>
                <div><span className="font-semibold">Score:</span> {selectedExam.score ?? "-"}</div>
                <div><span className="font-semibold">Percentage:</span> {selectedExam.percentage ?? "-"}%</div>
                <div><span className="font-semibold">Time Spent:</span> {selectedExam.timeSpent ? `${Math.floor(selectedExam.timeSpent / 60)}m ${selectedExam.timeSpent % 60}s` : "-"}</div>
                <div><span className="font-semibold">Completed At:</span> {selectedExam.completedAt ? new Date(selectedExam.completedAt).toLocaleString() : "-"}</div>
                <div><span className="font-semibold">Created:</span> {formatDate(selectedExam.createdAt)}</div>
              </div><div className="mt-4">
                  <div className="font-semibold mb-2">Questions & Answers:</div>
                  {selectedExam.questions && selectedExam.questions.length > questionsPerPage && (
                    <div className="flex justify-between items-center mb-2">
                      <Button size="sm" variant="outline" onClick={() => setQuestionPage(p => Math.max(1, p - 1))} disabled={questionPage === 1}>Prev</Button>
                      <span className="text-xs">Page {questionPage} of {Math.ceil(selectedExam.questions.length / questionsPerPage)}</span>
                      <Button size="sm" variant="outline" onClick={() => setQuestionPage(p => Math.min(Math.ceil(selectedExam.questions.length / questionsPerPage), p + 1))} disabled={questionPage === Math.ceil(selectedExam.questions.length / questionsPerPage)}>Next</Button>
                    </div>
                  )}
                  <ul className="list-decimal pl-5 space-y-2 max-h-72 overflow-y-auto">
                    {selectedExam.questions?.slice((questionPage - 1) * questionsPerPage, questionPage * questionsPerPage).map((q) => {
                      const answer = selectedExam.studentAnswers?.find((a: { questionId: string }) => a.questionId === q.id)
                      return (
                        <li key={q.id} className="mb-2">
                          <div className="font-medium">{q.question}</div>
                          <div className="text-xs text-muted-foreground">Type: {q.type}</div>
                          {q.options && q.options.length > 0 && (
                            <ul className="list-disc pl-5">
                              {q.options.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                          )}
                          <div className="text-xs text-muted-foreground">Correct: {q.correctAnswer?.toString()}</div>
                          {answer && (
                            <div className="text-xs mt-1">
                              <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {answer.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                              <span className="ml-2">Your Answer: {typeof answer.answer === 'boolean' ? answer.answer.toString() : answer.answer}</span>
                            </div>
                          )}
                          {q.explanation && (
                            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Explanation: {q.explanation}</div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div></>
            )}
            <DialogFooter>
              <Button onClick={() => setShowViewModal(false)} variant="secondary">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Exam Modal */}
        <Dialog open={showEditModal && !!editExam} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-full sm:max-w-2xl w-full p-2 sm:p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <DialogHeader>
              <DialogTitle>Edit Exam</DialogTitle>
              <DialogDescription>Update the AI-generated exam details</DialogDescription>
            </DialogHeader>
            {editExam && (
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                // PATCH request to update exam
                const res = await fetch(`/api/admin/ai-exams/${editExam._id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm),
                });
                if (res.ok) {
                  toast.success('Exam updated successfully');
                  setShowEditModal(false);
                  setEditExam(null);
                  fetchAIExams();
                } else {
                  toast.error('Failed to update exam');
                }
              }}>
                <div>
                  <label className="block font-medium mb-1">Title</label>
                  <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Duration (minutes)</label>
                  <Input type="number" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: Number(e.target.value) }))} required min={1} />
                </div>
                <div>
                  <label className="block font-medium mb-1">Questions</label>
                  {editForm.questions.length > questionsPerPage && (
                    <div className="flex justify-between items-center mb-2">
                      <Button size="sm" variant="outline" onClick={() => setQuestionPage(p => Math.max(1, p - 1))} disabled={questionPage === 1}>Prev</Button>
                      <span className="text-xs">Page {questionPage} of {Math.ceil(editForm.questions.length / questionsPerPage)}</span>
                      <Button size="sm" variant="outline" onClick={() => setQuestionPage(p => Math.min(Math.ceil(editForm.questions.length / questionsPerPage), p + 1))} disabled={questionPage === Math.ceil(editForm.questions.length / questionsPerPage)}>Next</Button>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {editForm.questions.slice((questionPage-1)*questionsPerPage, questionPage*questionsPerPage).map((q, idx) => (
                      <li key={idx + (questionPage-1)*questionsPerPage} className="border p-2 rounded">
                        <Input value={q.question} onChange={e => setEditForm(f => { const qs = [...f.questions]; qs[idx + (questionPage-1)*questionsPerPage].question = e.target.value; return { ...f, questions: qs }; })} className="mb-1" />
                        <div className="flex flex-col gap-1">
                          {/* 
                            q.options may be undefined, so we need to handle that for TypeScript.
                            Also, q.options[i] may be undefined, but Input value prop expects string | number | readonly string[] | undefined.
                            We'll default to an empty string if opt is undefined.
                          */}
                          {Array.isArray(q.options) && q.options.map((opt, i) => (
                            <Input
                              key={i}
                              value={typeof opt === "string" ? opt : ""}
                              onChange={e =>
                                setEditForm(f => {
                                  const qs = [...f.questions];
                                  // Defensive: ensure options exists and is an array
                                  const questionIdx = idx + (questionPage - 1) * questionsPerPage;
                                  const question = qs[questionIdx];
                                  if (Array.isArray(question?.options)) {
                                    question.options[i] = e.target.value;
                                  }
                                  return { ...f, questions: qs };
                                })
                              }
                              className="mb-1"
                            />
                          ))}
                        </div>
                        <Input
                          value={typeof q.type === "string" ? q.type : ""}
                          onChange={e =>
                            setEditForm(f => {
                              const qs = [...f.questions];
                              qs[idx + (questionPage-1)*questionsPerPage].type =
                                e.target.value as "multiple-choice" | "true-false" | "short-answer";
                              return { ...f, questions: qs };
                            })
                          }
                          className="mb-1"
                          placeholder="Type"
                        />
                        <Input
                          value={
                            typeof q.correctAnswer === "string"
                              ? q.correctAnswer
                              : Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.join(", ")
                                : typeof q.correctAnswer === "boolean"
                                  ? q.correctAnswer ? "True" : "False"
                                  : ""
                          }
                          onChange={e =>
                            setEditForm(f => {
                              const qs = [...f.questions];
                              // If the type is true-false, store as boolean, else as string
                              if (
                                qs[idx + (questionPage-1)*questionsPerPage].type === "true-false"
                              ) {
                                const val = e.target.value.trim().toLowerCase();
                                if (val === "true" || val === "false") {
                                  qs[idx + (questionPage-1)*questionsPerPage].correctAnswer = val === "true";
                                } else {
                                  qs[idx + (questionPage-1)*questionsPerPage].correctAnswer = "";
                                }
                              } else if (
                                Array.isArray(qs[idx + (questionPage-1)*questionsPerPage].correctAnswer)
                              ) {
                                // For multiple correct answers, split by comma
                                qs[idx + (questionPage-1)*questionsPerPage].correctAnswer = e.target.value.split(",").map(s => s.trim());
                              } else {
                                qs[idx + (questionPage-1)*questionsPerPage].correctAnswer = e.target.value;
                              }
                              return { ...f, questions: qs };
                            })
                          }
                          className="mb-1"
                          placeholder="Correct Answer"
                        />
                        <Input value={q.explanation} onChange={e => setEditForm(f => { const qs = [...f.questions]; qs[idx + (questionPage-1)*questionsPerPage].explanation = e.target.value; return { ...f, questions: qs }; })} className="mb-1" placeholder="Explanation" />
                        <Input value={q.points} onChange={e => setEditForm(f => { const qs = [...f.questions]; qs[idx + (questionPage-1)*questionsPerPage].points = Number(e.target.value); return { ...f, questions: qs }; })} className="mb-1" placeholder="Points" />
                      </li>
                    ))}
                  </ul>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 