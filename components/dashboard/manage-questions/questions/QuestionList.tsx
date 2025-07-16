"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Trash2, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  _id: string
  courseId: string
  questionText: string
  options: Option[]
  createdAt: string
}

interface Props {
  questions: Question[]
  deleteQuestion: (id: string) => void
}

export default function QuestionsList({ questions, deleteQuestion }: Props) {
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (id: string) => {
    const newOpenQuestions = new Set(openQuestions)
    if (newOpenQuestions.has(id)) {
      newOpenQuestions.delete(id)
    } else {
      newOpenQuestions.add(id)
    }
    setOpenQuestions(newOpenQuestions)
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium">No Questions Yet</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Start by selecting a course and adding your first question.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions Bank</CardTitle>
        <CardDescription>
          {questions.length} question{questions.length !== 1 ? "s" : ""} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, index) => (
          <Collapsible
            key={question._id}
            open={openQuestions.has(question._id)}
            onOpenChange={() => toggleQuestion(question._id)}
          >
            <Card className="border-l-4 border-l-primary/20">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-left">{question.questionText}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {openQuestions.has(question._id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Answer Options:</h4>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 p-2 rounded text-sm ${
                              option.isCorrect ? "bg-green-50 text-green-800 border border-green-200" : "bg-muted/50"
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="flex-1">{option.text}</span>
                            {option.isCorrect && (
                              <Badge variant="secondary" className="text-xs">
                                Correct
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestion(question._id)}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Question
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  )
}
