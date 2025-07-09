"use client"
import { getStudentFromToken } from "@/utils/auth"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import debounce from "lodash.debounce"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  BarChart2,
  Award,
  AlertCircle,
  Loader2,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ExamResult = {
  _id: string
  examTitle: string
  course: string
  score: number
  totalQuestions: number
  date?: string
  duration?: number
}

export default function Results() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  })

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearch(query)
        setPage(1)
      }, 300),
    [],
  )

  useEffect(() => {
    debouncedHandleSearch(searchQuery)
  }, [searchQuery, debouncedHandleSearch])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const student = await getStudentFromToken()
        const res = await fetch(
          `/api/results?studentId=${student?.id}&page=${page}&search=${debouncedSearch}&filter=${activeTab}`,
        )
        if (!res.ok) throw new Error("Failed to fetch results")
        const data: {
          results: ExamResult[]
          totalPages: number
          stats: {
            totalExams: number
            averageScore: number
            highestScore: number
            lowestScore: number
          }
        } = await res.json()
        setResults(data.results)
        setTotalPages(data.totalPages)
        setStats(data.stats)
      } catch (error) {
        console.error("Error fetching results:", error)
        setError("Failed to load results. Please try again.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [page, debouncedSearch, activeTab])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (e) {
      console.log(e)
      return "Unknown date"
    }
  }

  // Helper function to get score status and color
  const getScoreStatus = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: "Excellent",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else if (percentage >= 70) {
      return {
        label: "Good",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else if (percentage >= 50) {
      return {
        label: "Average",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else {
      return {
        label: "Needs Improvement",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 rounded-lg">
              <BarChart2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Exam Results</h1>
          </div>
          <p className="text-gray-600">View and track your examination performance</p>
        </div>
        <Button variant="outline" asChild className="border-gray-200 bg-transparent">
          <Link href="/student" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalExams}</div>
            <p className="text-xs text-gray-500 mt-1">Exams completed</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Across all exams</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Highest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.highestScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Your best performance</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Lowest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.lowestScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Area for improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Results History</CardTitle>
          <CardDescription>View and search your past exam results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by exam title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="passed" className="data-[state=active]:bg-white">
                  Passed
                </TabsTrigger>
                <TabsTrigger value="failed" className="data-[state=active]:bg-white">
                  Failed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 max-w-md">
                {searchQuery || activeTab !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't taken any exams yet."}
              </p>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-4">
              {results.map((result) => {
                const percentage = (result.score / result.totalQuestions) * 100
                const formattedPercentage = Number.parseFloat(percentage.toFixed(1))
                const scoreStatus = getScoreStatus(formattedPercentage)
                return (
                  <Card key={result._id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900 mb-1">{result.examTitle}</CardTitle>
                          <CardDescription className="text-gray-600">{result.course}</CardDescription>
                        </div>
                        <Badge variant="outline" className={scoreStatus.color}>
                          <div className="flex items-center gap-1">
                            {scoreStatus.icon}
                            <span className="font-medium">{scoreStatus.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            Score:{" "}
                            <span className="font-medium text-gray-900">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            Duration: <span className="font-medium text-gray-900">{result.duration} min</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            Date: <span className="font-medium text-gray-900">{formatDate(result.date || "")}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Score Percentage</span>
                          <span className="text-sm font-medium text-gray-900">{formattedPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
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

                      <div className="pt-2">
                        <Link href={`/student/results/${result._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50 bg-transparent"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex justify-between pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="border-gray-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>
            <div className="text-sm text-gray-600 flex items-center">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="border-gray-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
