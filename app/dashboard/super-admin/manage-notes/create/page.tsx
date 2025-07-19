"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Upload, FileText, Eye, Download, Search, Plus, X, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown"
import Header from "@/components/dashboard/Header"

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
  const [showUploadForm, setShowUploadForm] = useState(false)

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
        setShowUploadForm(false)
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
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      case "doc":
      case "docx":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      case "txt":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
      default:
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "📄"
      case "doc":
      case "docx":
        return "📝"
      case "txt":
        return "📃"
      default:
        return "📄"
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase())
    const matchesFileType = fileTypeFilter === "all" || note.fileType.toLowerCase() === fileTypeFilter
    return matchesSearch && matchesFileType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Manage Notes" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Course Selection */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Select Course</CardTitle>
            <CardDescription className="text-muted-foreground">Choose a course to manage its notes</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
          </CardContent>
        </Card>

        {selectedCourse && (
          <>
            {/* Upload Section */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Upload className="h-5 w-5" />
                      Course Notes
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage and upload notes for the selected course
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="border-border bg-background text-foreground hover:bg-muted"
                  >
                    {showUploadForm ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Note
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {showUploadForm && (
                <CardContent className="space-y-4 border-t border-border pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">Note Title *</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter note title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-sm text-muted-foreground text-right">{title.length}/100 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-foreground">Upload File *</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleFileChange}
                        className="cursor-pointer bg-background border-border text-foreground"
                      />
                      <p className="text-sm text-muted-foreground">Supported: PDF, TXT, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-foreground">File Preview</Label>
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-foreground">{file?.name}</span>
                          <Badge className={getFileTypeColor(file?.name.split(".").pop() || "")}>
                            {file?.name.split(".").pop()?.toUpperCase()}
                          </Badge>
                          {file && (
                            <span className="text-sm text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                          )}
                        </div>
                        <iframe 
                          src={previewUrl} 
                          className="w-full h-64 border border-border rounded bg-background" 
                          title="File preview" 
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={uploadNote} 
                    disabled={isUploading || !title || !file} 
                    className="w-full border-border bg-background text-foreground hover:bg-muted" 
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              )}
            </Card>

            {/* Notes List */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Search className="h-5 w-5" />
                  Course Notes ({filteredNotes.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and manage all notes for this course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Search Notes</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Filter by File Type</Label>
                    <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                      <SelectTrigger className="bg-background border-border text-foreground">
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

                {/* Results Count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredNotes.length} of {notes.length} notes
                  </p>
                  {(search || fileTypeFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch("")
                        setFileTypeFilter("all")
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                  <Card className="border-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {notes.length === 0 ? "No notes available" : "No notes found"}
                      </h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        {notes.length === 0
                          ? "No notes have been uploaded for this course yet. Click 'Upload Note' to add the first note."
                          : "No notes match your current search and filter criteria. Try adjusting your filters."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNotes.map((note) => (
                      <Card 
                        key={note._id} 
                        className="hover:shadow-lg transition-all duration-200 border-border bg-card hover:bg-card/80"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{getFileTypeIcon(note.fileType)}</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                                  {note.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {note.fileType.toUpperCase()} file
                                </p>
                              </div>
                            </div>

                            <Badge className={`text-xs ${getFileTypeColor(note.fileType)}`}>
                              {note.fileType.toUpperCase()}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild 
                                className="flex-1 border-border bg-background text-foreground hover:bg-muted"
                              >
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

                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild 
                                className="flex-1 border-border bg-background text-foreground hover:bg-muted"
                              >
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
