"use client"

import { useState } from "react"
import { Eye, User, BookOpen, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Result } from "@/types/result"
import ResultDetailsModal from "./ResultDetailsModal"

export default function ResultTable({ results }: { results: Result[] }) {
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "B":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "C":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "D":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "F":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium">No Results Found</h3>
        <p className="text-muted-foreground max-w-md mt-2">No examination results match your current filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result._id} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{result.studentId.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{result.examId.title}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {result.score} / {result.totalMarks}
                      </span>
                      <span className="text-muted-foreground">
                        ({((result.score / result.totalMarks) * 100).toFixed(1)}%)
                      </span>
                    </div>

                    <Badge className={getGradeColor(result.grade)}>Grade {result.grade}</Badge>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResult(result)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for viewing details */}
      {selectedResult && <ResultDetailsModal result={selectedResult} onClose={() => setSelectedResult(null)} />}
    </>
  )
}
