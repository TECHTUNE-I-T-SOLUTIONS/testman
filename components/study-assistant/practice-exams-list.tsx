"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Clock, 
  FileText, 
  Calendar, 
  Brain, 
  RefreshCw,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

interface PracticeExam {
  _id: string
  title: string
  description: string
  questions: Array<{
    id: string
    question: string
    type: string
    options?: string[]
    correctAnswer: number | string
    explanation: string
    points: number
  }>
  timeLimit: number
  totalPoints: number
  createdAt: string
  sessionId?: string
  materialIds: string[]
}

interface PracticeExamsListProps {
  exams: PracticeExam[]
  isGenerating: boolean
  onRefresh: () => void
}

export default function PracticeExamsList({ exams, isGenerating, onRefresh }: PracticeExamsListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  const getExamDifficulty = (questionCount: number) => {
    if (questionCount <= 5) return { label: "Easy", color: "bg-green-500" }
    if (questionCount <= 10) return { label: "Medium", color: "bg-yellow-500" }
    return { label: "Hard", color: "bg-red-500" }
  }

  const getTimeEstimate = (timeLimit: number) => {
    return `${timeLimit} mins`
  }

  // Filter and sort exams
  const filteredAndSortedExams = exams
    .filter(exam => 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "difficulty":
          return b.questions.length - a.questions.length
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExams.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExams = filteredAndSortedExams.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  if (exams.length === 0 && !isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practice Exams Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Upload your study materials and let Alex AI generate practice questions automatically, 
          or chat with Alex and ask for practice questions.
        </p>
        <Button onClick={onRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Practice Exams ({filteredAndSortedExams.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-generated practice questions from your materials
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="difficulty">By Difficulty</SelectItem>
              <SelectItem value="title">By Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isGenerating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Generating Practice Exam...</p>
                <p className="text-sm text-blue-600">Alex AI is creating questions from your materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filteredAndSortedExams.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No exams match your search criteria.</p>
        </div>
      )}

      <div className="grid gap-4">
        {paginatedExams.map((exam) => {
          return (
            <Card key={exam._id} className="bg-white shadow-sm rounded-md hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-semibold">{exam.title}</CardTitle>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100 border-none">
                  {getExamDifficulty(exam.questions.length).label}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {exam.description}
                </CardDescription>

                <Separator className="my-2" />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Time: {getTimeEstimate(exam.timeLimit)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Questions: {exam.questions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Total Points: {exam.totalPoints}</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 flex justify-end">
                <Button size="sm" className="gap-2">
                  Start Exam
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedExams.length)} of {filteredAndSortedExams.length} exams
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}