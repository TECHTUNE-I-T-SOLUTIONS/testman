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
        color:
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
        icon: <Award className="h-4 w-4 text-green-700 dark:text-green-200" />,
      }
    } else if (percentage >= 70) {
      return {
        label: "Good",
        color:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
        icon: <Award className="h-4 w-4 text-blue-700 dark:text-blue-200" />,
      }
    } else if (percentage >= 50) {
      return {
        label: "Average",
        color:
          "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
        icon: <Award className="h-4 w-4 text-yellow-700 dark:text-yellow-200" />,
      }
    } else {
      return {
        label: "Needs Improvement",
        color:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
        icon: <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-200" />,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 dark:bg-gray-100 rounded-lg">
              <BarChart2 className="h-6 w-6 text-white dark:text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Exam Results</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">View and track your examination performance</p>
        </div>
        <Button variant="outline" asChild className="border-gray-200 dark:border-gray-700 bg-transparent">
          <Link href="/student" className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Home className="h-4 w-4 text-gray-900 dark:text-white" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-200 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-200" />
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Exams completed</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-200" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all exams</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-200 flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600 dark:text-green-300" />
              Highest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-300">{stats.highestScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your best performance</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
              Lowest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-300">{stats.lowestScore.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Area for improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">Results History</CardTitle>
          <CardDescription className="dark:text-gray-300">View and search your past exam results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <Input
                placeholder="Search by exam title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="passed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
                  Passed
                </TabsTrigger>
                <TabsTrigger value="failed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
                  Failed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-3/4 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 mt-2 dark:bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                      <Skeleton className="h-6 w-24 dark:bg-gray-700" />
                    </div>
                    <Skeleton className="h-3 w-full dark:bg-gray-700" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">
              <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-200" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-200" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
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
                  <Card key={result._id} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900 dark:text-white mb-1">{result.examTitle}</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-300">{result.course}</CardDescription>
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
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <FileText className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-200" />
                          <span>
                            Score:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-200" />
                          <span>
                            Duration: <span className="font-medium text-gray-900 dark:text-white">{result.duration} min</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-200" />
                          <span>
                            Date: <span className="font-medium text-gray-900 dark:text-white">{formatDate(result.date || "")}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Score Percentage</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formattedPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
                            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent text-gray-900 dark:text-white"
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
          <CardFooter className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-900 dark:text-white" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2 text-gray-900 dark:text-white" />
                  Previous
                </>
              )}
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-900 dark:text-white" />
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2 text-gray-900 dark:text-white" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
