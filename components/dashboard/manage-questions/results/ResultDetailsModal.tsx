"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, User, BookOpen, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Answer {
  questionId: { questionText: string }
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

interface Result {
  _id: string
  studentId: { _id: string; name: string }
  examId: { _id: string; title: string }
  score: number
  grade: string
  totalMarks: number
  answers?: Answer[]
}

interface Props {
  result: Result
  onClose: () => void
}

export default function ResultDetailsModal({ result, onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(0)
  const answers = result.answers || []
  const currentAnswer = answers[currentPage]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Examination Results
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{result.studentId.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{result.examId.title}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {result.score} / {result.totalMarks}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({((result.score / result.totalMarks) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Badge className={getGradeColor(result.grade)}>Grade {result.grade}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Display */}
        {currentAnswer && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Question {currentPage + 1} of {answers.length}
                  </h4>
                  <Badge variant={currentAnswer.isCorrect ? "default" : "destructive"}>
                    {currentAnswer.isCorrect ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {currentAnswer.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm mb-2">Question:</p>
                    <p className="text-sm bg-muted p-3 rounded">{currentAnswer.questionId.questionText}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm mb-2">Student&apos;s Answer:</p>
                      <div
                        className={`p-3 rounded text-sm ${
                          currentAnswer.isCorrect
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {currentAnswer.studentAnswer}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm mb-2">Correct Answer:</p>
                      <div className="p-3 rounded text-sm bg-blue-50 text-blue-800 border border-blue-200">
                        {currentAnswer.correctAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentPage + 1} / {answers.length}
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === answers.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
