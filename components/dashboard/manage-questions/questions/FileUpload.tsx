"use client"

import type React from "react"

import * as XLSX from "xlsx"
import { useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Props {
  selectedCourse: string
}

interface Option {
  text: string
  isCorrect: boolean
}

interface ExcelRow {
  Question: string
  "Option A": string
  "Option B": string
  "Option C": string
  "Option D": string
  Answer: "A" | "B" | "C" | "D"
}

interface ParsedQuestion {
  questionText: string
  options: Option[]
}

export default function FileUpload({ selectedCourse }: Props) {
  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

      const formatted = jsonData.map((item) => ({
        questionText: item["Question"] || "",
        options: [
          { text: item["Option A"] || "", isCorrect: item["Answer"] === "A" },
          { text: item["Option B"] || "", isCorrect: item["Answer"] === "B" },
          { text: item["Option C"] || "", isCorrect: item["Answer"] === "C" },
          { text: item["Option D"] || "", isCorrect: item["Answer"] === "D" },
        ].filter((opt) => opt.text),
      }))

      setPreviewQuestions(formatted)
    }

    reader.readAsArrayBuffer(file)
  }

  const uploadToBackend = async () => {
    if (!selectedCourse) return toast.error("Please select a course")

    const questionsPayload = previewQuestions.map((q) => ({
      courseId: selectedCourse,
      questionText: q.questionText,
      options: q.options,
    }))

    try {
      setUploading(true)
      const res = await fetch("/api/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsPayload }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Upload failed")

      toast.success("Bulk upload successful!")
      setPreviewQuestions([])
    } catch (err) {
      const error = err as Error
      toast.error(error.message || "Failed to upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="excel-file">Upload Excel File</Label>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <Input id="excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="flex-1" />
        </div>
        <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls</p>
      </div>

      {previewQuestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Preview Questions</span>
              </div>
              <Badge variant="secondary">{previewQuestions.length} questions</Badge>
            </div>

            <ScrollArea className="h-64 border rounded-lg p-4">
              <div className="space-y-4">
                {previewQuestions.map((q, idx) => (
                  <div key={idx} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium text-sm mb-2">
                      Q{idx + 1}: {q.questionText}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className={opt.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <span className={opt.isCorrect ? "text-green-600 font-medium" : ""}>
                            {opt.text}
                            {opt.isCorrect && " ✓"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button onClick={uploadToBackend} disabled={uploading} className="w-full mt-4">
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {previewQuestions.length} Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
