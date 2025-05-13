"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Filter, Download, BarChart2, AlertCircle, GraduationCap } from 'lucide-react'
import { Result } from "@/types/result"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import ResultTable from "@/components/dashboard/manage-questions/results/ResultTable"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


// interface Result {
//   _id: string
//   studentId: { _id: string; name: string }
//   examId: { _id: string; title: string }
//   score: number
//   totalMarks: number
//   grade: string
//   answers?: { questionId: { questionText: string }; isCorrect: boolean }[]
// }

export default function ResultPage() {
  const [results, setResults] = useState<Result[]>([])
  const [filteredResults, setFilteredResults] = useState<Result[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("results")

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/results`)
        if (!res.ok) throw new Error("Failed to fetch results")
        const data: Result[] = await res.json()
        setResults(data)
        setFilteredResults(data)
      } catch (error) {
        console.error("Error fetching results:", error)
        setError("Failed to load results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  useEffect(() => {
    if (!results.length) return
    let filtered = [...results]

    if (searchTerm) {
      filtered = filtered.filter(
        result =>
          result.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.examId.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter(result => result.grade === gradeFilter)
    }

    setFilteredResults(filtered)
  }, [searchTerm, gradeFilter, results])

  const stats = {
    totalStudents: results.length,
    averageScore: (() => {
      const validScores = results.filter(
        (result) =>
          typeof result.score === "number" &&
          typeof result.totalMarks === "number" &&
          result.totalMarks > 0
      );

      if (validScores.length === 0) return "0";

      const totalPercentage = validScores.reduce((sum, result) => {
        return sum + (result.score / result.totalMarks) * 100;
      }, 0);

      return (totalPercentage / validScores.length).toFixed(1);
    })(),

    passRate: results.length
      ? ((results.filter(r => ["A", "B", "C", "D"].includes(r.grade)).length / results.length) * 100).toFixed(1)
      : "0",
    gradeDistribution: {
      A: results.filter(r => r.grade === "A").length,
      B: results.filter(r => r.grade === "B").length,
      C: results.filter(r => r.grade === "C").length,
      D: results.filter(r => r.grade === "D").length,
      F: results.filter(r => r.grade === "F").length,
    },
  }

  const handleExportResults = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(16)
    doc.text("Student Examination Results", 14, 20)

    const tableColumn = ["Student", "Exam", "Score", "Total Marks", "Grade"]
    const tableRows: string[][] = []

    filteredResults.forEach((result) => {
      tableRows.push([
        result.studentId.name,
        result.examId.title,
        result.score.toString(),
        result.totalMarks.toString(),
        result.grade,
      ])
    })

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    })

    doc.save("student-results.pdf")
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Manage Student Results
          </h1>
          <p className="text-muted-foreground mt-1">View, analyze, and export student examination results</p>
        </div>
        <Button onClick={handleExportResults} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Results</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student or exam..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by grade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A">A Grade</SelectItem>
                  <SelectItem value="B">B Grade</SelectItem>
                  <SelectItem value="C">C Grade</SelectItem>
                  <SelectItem value="D">D Grade</SelectItem>
                  <SelectItem value="F">F Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Examination Results</CardTitle>
                <CardDescription>
                  {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                  {searchTerm && ` for "${searchTerm}"`}
                  {gradeFilter !== "all" && ` with grade ${gradeFilter}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredResults.length > 0 ? (
                  <ResultTable results={filteredResults} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Results Found</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      {searchTerm || gradeFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No examination results are available for this department."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Students with recorded results</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">Across all examinations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.passRate}%</div>
                  <p className="text-xs text-muted-foreground">Students with passing grades (A-D)</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Breakdown of grades across all examinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-center">
                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex flex-col items-center">
                      <Badge 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2
                          ${grade === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                           grade === 'B' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                           grade === 'C' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                           grade === 'D' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                           'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {grade}
                      </Badge>
                      <span className="text-2xl font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground">Students</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Detailed Analytics</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}