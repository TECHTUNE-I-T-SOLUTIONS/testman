"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Upload, FileText, Eye, Download, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown"
import Header from "@/components/dashboard/Header"

// interface Course {
//   _id: string
//   title: string
//   department: string
//   faculty: string
// }

interface Note {
  _id: string
  title: string
  fileUrl: string
  fileType: string
  courseId: string
}

export default function ManageNotesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [notes, setNotes] = useState<Note[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/notes?courseId=${selectedCourse}`)
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch(() => toast.error("Failed to fetch notes"))
    }
  }, [selectedCourse])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowed.includes(uploadedFile.type)) {
      toast.error("Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.")
      return
    }

    // Check file size (10MB limit)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setFile(uploadedFile)
    setPreviewUrl(URL.createObjectURL(uploadedFile))
  }

  const uploadNote = async () => {
    if (!selectedCourse || !title || !file) {
      return toast.error("Please select course, add title, and choose a file")
    }

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      const base64 = reader.result?.toString()
      if (!base64) {
        setIsUploading(false)
        return toast.error("Failed to read file")
      }

      const fileType = file.name.split(".").pop()?.toLowerCase()

      try {
        const res = await fetch("/api/notes/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: selectedCourse,
            title,
            fileUrl: base64,
            fileType,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        toast.success("Note uploaded successfully!")
        setNotes((prev) => [...prev, data.note])
        setFile(null)
        setTitle("")
        setPreviewUrl("")
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed"
        toast.error(errorMessage)
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800 border-red-200"
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "txt":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase())
    const matchesFileType = fileTypeFilter === "all" || note.fileType.toLowerCase() === fileTypeFilter
    return matchesSearch && matchesFileType
  })

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Manage Notes" />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>Choose a course to manage its notes</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
          </CardContent>
        </Card>

        {selectedCourse && (
          <>
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Note
                </CardTitle>
                <CardDescription>Add a new note for the selected course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Note Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter note title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                    <p className="text-sm text-muted-foreground text-right">{title.length}/100 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">Supported: PDF, TXT, DOC, DOCX (Max 10MB)</p>
                  </div>
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label>File Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{file?.name}</span>
                        <Badge className={getFileTypeColor(file?.name.split(".").pop() || "")}>
                          {file?.name.split(".").pop()?.toUpperCase()}
                        </Badge>
                      </div>
                      <iframe src={previewUrl} className="w-full h-64 border rounded" title="File preview" />
                    </div>
                  </div>
                )}

                <Button onClick={uploadNote} disabled={isUploading || !title || !file} className="w-full" size="lg">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading Note...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Note
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Course Notes
                </CardTitle>
                <CardDescription>Manage and view all notes for this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Search Notes</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Filter by File Type</Label>
                    <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All File Types</SelectItem>
                        <SelectItem value="pdf">PDF Files</SelectItem>
                        <SelectItem value="doc">DOC Files</SelectItem>
                        <SelectItem value="docx">DOCX Files</SelectItem>
                        <SelectItem value="txt">TXT Files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
                    <p className="text-gray-600">
                      {notes.length === 0
                        ? "No notes have been uploaded for this course yet."
                        : "No notes match your current search and filter criteria."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                      <Card key={note._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm line-clamp-2">{note.title}</h3>
                              </div>
                            </div>

                            <Badge className={`text-xs ${getFileTypeColor(note.fileType)}`}>
                              {note.fileType.toUpperCase()}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                                <a
                                  href={note.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </a>
                              </Button>

                              <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                                <a href={note.fileUrl} download className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
