"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Trash2, Edit, Search, FileText, Eye, Download, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown"
import Header from "@/components/dashboard/Header"

interface Note {
  _id: string
  title: string
  fileUrl: string
  fileType: string
  courseId: {
    _id: string
    name: string
    code: string
  }
}

export default function ViewNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newFileUrl, setNewFileUrl] = useState("")
  const [newFileType, setNewFileType] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        const noteRes = await fetch("/api/notes")
        const noteData = await noteRes.json()
        setNotes(noteData)
        setFilteredNotes(noteData)
      } catch {
        toast.error("Failed to load notes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    let filtered = notes

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.courseId.name.toLowerCase().includes(search.toLowerCase()) ||
          note.courseId.code.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter((note) => note.courseId._id === selectedCourse)
    }

    // Filter by file type
    if (fileTypeFilter !== "all") {
      filtered = filtered.filter((note) => note.fileType.toLowerCase() === fileTypeFilter)
    }

    setFilteredNotes(filtered)
  }, [notes, search, selectedCourse, fileTypeFilter])

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Failed to delete note")

      const updated = notes.filter((note) => note._id !== id)
      setNotes(updated)
      setFilteredNotes(updated)
      toast.success("Note deleted successfully")
    } catch {
      toast.error("Could not delete note")
    }
  }

  const handleEdit = (noteId: string) => {
    const noteToEdit = notes.find((note) => note._id === noteId)
    if (noteToEdit) {
      setCurrentNote(noteToEdit)
      setNewTitle(noteToEdit.title)
      setNewFileUrl(noteToEdit.fileUrl)
      setNewFileType(noteToEdit.fileType)
      setModalOpen(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowed = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowed.includes(file.type)) {
        toast.error("Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.")
        return
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      setNewFile(file)
      setNewFileUrl(URL.createObjectURL(file))
      setNewFileType(file.name.split(".").pop()?.toLowerCase() || "")
    }
  }

  const handleSave = async () => {
    if (!currentNote || !newTitle) {
      toast.error("Please provide a title")
      return
    }

    setIsSaving(true)
    const formData = new FormData()
    formData.append("id", currentNote._id)
    formData.append("title", newTitle)
    formData.append("fileUrl", newFileUrl)
    formData.append("fileType", newFileType)

    if (newFile) {
      formData.append("file", newFile)
    }

    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        body: formData,
      })

      if (res.ok) {
        toast.success("Note updated successfully")
        setModalOpen(false)

        // Update the note in state
        const updatedNotes = notes.map((note) =>
          note._id === currentNote._id
            ? { ...note, title: newTitle, fileUrl: newFileUrl, fileType: newFileType }
            : note,
        )
        setNotes(updatedNotes)
      } else {
        toast.error("Failed to update the note")
      }
    } catch {
      toast.error("Failed to update the note")
    } finally {
      setIsSaving(false)
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header title="All Notes" />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                    <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="All Notes" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title, course name, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filter by Course</Label>
                <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
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
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">PDF</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notes.filter((note) => note.fileType === "pdf").length}</p>
                  <p className="text-sm text-muted-foreground">PDF Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">DOC</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {notes.filter((note) => ["doc", "docx"].includes(note.fileType)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Word Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-sm">TXT</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notes.filter((note) => note.fileType === "txt").length}</p>
                  <p className="text-sm text-muted-foreground">Text Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 mb-4">
                {notes.length === 0 ? "No notes have been uploaded yet." : "No notes match your current filters."}
              </p>
              <Button asChild>
                <a href="/dashboard/super-admin/manage-notes/create">Upload Your First Note</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2">{note.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.courseId.name} ({note.courseId.code})
                        </p>
                      </div>
                    </div>

                    <Badge className={`text-xs ${getFileTypeColor(note.fileType)}`}>
                      {note.fileType.toUpperCase()}
                    </Badge>

                    <div className="flex items-center gap-1">
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

                      <Button variant="outline" size="sm" onClick={() => handleEdit(note._id)}>
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNote(note._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update the note title and optionally replace the file</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter note title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground text-right">{newTitle.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Current File Preview</Label>
                {newFileUrl && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">
                        {newFile?.name || `${currentNote?.title}.${currentNote?.fileType}`}
                      </span>
                      <Badge className={getFileTypeColor(newFileType)}>{newFileType.toUpperCase()}</Badge>
                    </div>
                    <iframe src={newFileUrl} className="w-full h-60 border rounded" title="File preview" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="replace-file">Replace File (Optional)</Label>
                <Input
                  id="replace-file"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">Leave empty to keep current file</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !newTitle}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
