"use client"

import type React from "react"

import { getStudentFromToken } from "@/utils/auth"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import debounce from "lodash.debounce"
import { Search, ChevronLeft, ChevronRight, Home, FileText, BarChart2, Award, AlertCircle, Loader2 } from "lucide-react"

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

        // For demo purposes, let's add some additional fields if they don't exist
        const enhancedResults = data.results.map((result) => ({
          ...result,
          date: result.date || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          duration: result.duration || Math.floor(Math.random() * 60) + 30,
        }))

        setResults(enhancedResults)
        setTotalPages(data.totalPages)
        setStats(
          data.stats || {
            totalExams: enhancedResults.length,
            averageScore: enhancedResults.length
              ? enhancedResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) /
                enhancedResults.length
              : 0,
            highestScore: enhancedResults.length
              ? Math.max(...enhancedResults.map((r) => (r.score / r.totalQuestions) * 100))
              : 0,
            lowestScore: enhancedResults.length
              ? Math.min(...enhancedResults.map((r) => (r.score / r.totalQuestions) * 100))
              : 0,
          },
        )
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
      console.log(e);
      return "Unknown date"
    }
  }

  // Helper function to get score status and color
  const getScoreStatus = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: "Excellent",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else if (percentage >= 70) {
      return {
        label: "Good",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else if (percentage >= 50) {
      return {
        label: "Average",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Award className="h-4 w-4" />,
      }
    } else {
      return {
        label: "Needs Improvement",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="h-4 w-4" />,
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-primary" />
            Exam Results
          </h1>
          <p className="text-muted-foreground mt-1">View and track your examination performance</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/student" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-muted-foreground">Exams completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Your best performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Area for improvement</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Results History</CardTitle>
          <CardDescription>View and search your past exam results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by exam title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="passed">Passed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Results Found</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                {searchQuery || activeTab !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't taken any exams yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => {
                const percentage = (result.score / result.totalQuestions) * 100
                const formattedPercentage = Number.parseFloat(percentage.toFixed(1))
                const scoreStatus = getScoreStatus(formattedPercentage)

                return (
                  <Card key={result._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{result.examTitle}</CardTitle>
                          <CardDescription>{result.course}</CardDescription>
                        </div>
                        <Badge variant="outline" className={scoreStatus.color}>
                          <div className="flex items-center gap-1">
                            {scoreStatus.icon}
                            <span>{scoreStatus.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            Score:{" "}
                            <span className="font-medium text-foreground">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            Duration: <span className="font-medium text-foreground">{result.duration} min</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>
                            Date: <span className="font-medium text-foreground">{formatDate(result.date || "")}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Score Percentage</span>
                          <span className="text-xs font-medium">{formattedPercentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${
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
                        <div className="mt-2">
                          <Link href={`/student/results/${result._id}`}>
                            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              View Details
                            </button>
                          </Link>
                        </div>              
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
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
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
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

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

                                           