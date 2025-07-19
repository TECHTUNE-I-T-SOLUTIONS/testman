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
  Eye, 
  Calendar, 
  Clock, 
  Users, 
  FileText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Header from "@/components/dashboard/Header"

interface AIExamResult {
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
  studentAnswers: Array<{
    questionId: string
    answer: string | boolean | string[]
    isCorrect: boolean
    timeSpent: number
  }>
  score?: number
  percentage?: number
  duration: number
  timeSpent?: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}

const ITEMS_PER_PAGE = 12

export default function AIExamResultsPage() {
  const [results, setResults] = useState<AIExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedResult, setSelectedResult] = useState<AIExamResult | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [answerPage, setAnswerPage] = useState(1)
  const answersPerPage = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 20

  useEffect(() => {
    fetchAIExamResults()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, scoreFilter])

  const fetchAIExamResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/ai-exams?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`
      )
      if (response.ok) {
        const data = await response.json()
        // Only show exams with studentAnswers
        const filtered = data.exams.filter((exam: AIExamResult) => Array.isArray(exam.studentAnswers) && exam.studentAnswers.length > 0)
        setResults(filtered)
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
      } else {
        throw new Error('Failed to fetch AI exam results')
      }
    } catch (error) {
      console.error('Error fetching AI exam results:', error)
      toast.error('Failed to load AI exam results')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
    if (percentage >= 60) return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
  }

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent"
    if (percentage >= 60) return "Good"
    if (percentage >= 40) return "Average"
    return "Poor"
  }

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <Award className="h-3 w-3" />
    if (percentage >= 60) return <CheckCircle className="h-3 w-3" />
    return <AlertCircle className="h-3 w-3" />
  }

  const stats = {
    totalResults: results.length,
    averageScore: results.length > 0 ? Math.round(results.reduce((sum, result) => sum + (result.percentage ?? 0), 0) / results.length) : 0,
    highestScore: results.length > 0 ? Math.max(...results.map(r => r.percentage ?? 0)) : 0,
    lowestScore: results.length > 0 ? Math.min(...results.map(r => r.percentage ?? 0)) : 0,
  }

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="AI Exam Results" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading AI exam results...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="AI Exam Results" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Exam Results</h1>
            <p className="text-muted-foreground">View and analyze results from AI-generated exams</p>
          </div>
          <Button 
            onClick={fetchAIExamResults} 
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
                  <p className="text-sm font-medium text-muted-foreground">Total Results</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalResults}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.averageScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.highestScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.lowestScore}%
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
                    placeholder="Search by student name, exam title, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-full sm:w-48 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="excellent">Excellent (80%+)</SelectItem>
                  <SelectItem value="good">Good (60-79%)</SelectItem>
                  <SelectItem value="average">Average (40-59%)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;40%)</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || scoreFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setScoreFilter("all")
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
            Showing {results.length} results
          </p>
        </div>

        {/* Results Grid */}
        {results.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Results Found</h3>
            <p className="text-muted-foreground">There are currently no AI exam results to display.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((result) => (
              <Card 
                key={result._id} 
                className="transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-card/80"
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
                            {result.title || "Unknown Exam"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.courseId?.name || "Unknown Course"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {result.studentId?.name || "Unknown Student"} {result.studentId?.matricNumber ? `(${result.studentId.matricNumber})` : null}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {result.score}/{result.questions.length} correct
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="pt-2">
                      <Badge 
                        variant="outline" 
                        className={getScoreBadgeColor(result.percentage ?? 0)}
                      >
                        {getScoreIcon(result.percentage ?? 0)}
                        <span className="ml-1 font-medium">{(result.percentage ?? 0).toFixed(1)}%</span>
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(result.percentage ?? 0)}
                      </p>
                    </div>

                    {/* Time Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Time: {formatDuration(result.timeSpent || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {formatDate(result.completedAt || result.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border bg-background text-foreground hover:bg-muted"
                        onClick={() => {
                          setSelectedResult(result)
                          setShowResultModal(true)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
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
                ({results.length} results)
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

        {/* Result Details Modal */}
        <Dialog open={showResultModal && !!selectedResult} onOpenChange={setShowResultModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Result Details</DialogTitle>
              <DialogDescription>Full details of the AI exam result for any student</DialogDescription>
            </DialogHeader>
            {selectedResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-semibold">Student:</span> {selectedResult.studentId?.name || "Unknown Student"} {selectedResult.studentId?.matricNumber ? `(${selectedResult.studentId.matricNumber})` : null}</div>
                  <div><span className="font-semibold">Exam:</span> {selectedResult.title || "Unknown Exam"}</div>
                  <div><span className="font-semibold">Course:</span> {selectedResult.courseId?.name || "Unknown Course"}</div>
                  <div><span className="font-semibold">Score:</span> {selectedResult.score} / {selectedResult.questions.length} ({selectedResult.percentage}%)</div>
                  <div><span className="font-semibold">Questions:</span> {selectedResult.questions.length}</div>
                  <div><span className="font-semibold">Duration:</span> {formatDuration(selectedResult.duration)}</div>
                  <div><span className="font-semibold">Time Taken:</span> {formatDuration(selectedResult.timeSpent || 0)}</div>
                  <div><span className="font-semibold">Completed At:</span> {formatDate(selectedResult.completedAt || selectedResult.createdAt)}</div>
                </div>
                <div className="mt-4">
                  <div className="font-semibold mb-2">Answers & Question Review:</div>
                  {selectedResult.studentAnswers && selectedResult.studentAnswers.length > answersPerPage && (
                    <div className="flex justify-between items-center mb-2">
                      <Button size="sm" variant="outline" onClick={() => setAnswerPage(p => Math.max(1, p - 1))} disabled={answerPage === 1}>Prev</Button>
                      <span className="text-xs">Page {answerPage} of {Math.ceil(selectedResult.studentAnswers.length / answersPerPage)}</span>
                      <Button size="sm" variant="outline" onClick={() => setAnswerPage(p => Math.min(Math.ceil(selectedResult.studentAnswers.length / answersPerPage), p + 1))} disabled={answerPage === Math.ceil(selectedResult.studentAnswers.length / answersPerPage)}>Next</Button>
                    </div>
                  )}
                  <ul className="list-decimal pl-5 space-y-2 max-h-72 overflow-y-auto">
                    {selectedResult.studentAnswers?.slice((answerPage-1)*answersPerPage, answerPage*answersPerPage).map((a, idx) => (
                      <li key={idx + (answerPage-1)*answersPerPage} className="mb-2">
                        <div className="font-medium">{selectedResult.questions.find(q => q.id === a.questionId)?.question}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold ${a.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{a.isCorrect ? 'Correct' : 'Incorrect'}</span>
                          <span className="text-xs text-muted-foreground">Your Answer: {a.answer}</span>
                          <span className="text-xs text-muted-foreground">Correct: {selectedResult.questions.find(q => q.id === a.questionId)?.correctAnswer}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowResultModal(false)} variant="secondary">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 