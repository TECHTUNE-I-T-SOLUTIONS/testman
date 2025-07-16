"use client"

import { useEffect, useState } from "react"
import { FileText, Search, Download, BookOpen, Filter } from "lucide-react"
import toast from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown"

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

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [search, setSearch] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/notes")
        const data = await res.json()
        setNotes(data)
        setFilteredNotes(data)
      } catch (error) {
        console.error("Failed to load notes:", error)
        toast.error("Failed to load notes.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  useEffect(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.fileType.toLowerCase().includes(search.toLowerCase()) ||
        note.courseId.name.toLowerCase().includes(search.toLowerCase())
      const matchesCourse = selectedCourse ? note.courseId._id === selectedCourse : true
      return matchesSearch && matchesCourse
    })
    setFilteredNotes(filtered)
  }, [search, selectedCourse, notes])

  const handleDownload = (fileUrl: string, title: string) => {
    try {
      const anchor = document.createElement("a")
      anchor.href = fileUrl
      anchor.download = title
      anchor.target = "_blank"
      anchor.click()
      toast.success("Download started!")
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Download failed.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gray-900 rounded-full">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access and download study materials for your courses. All notes are organized by course for easy navigation.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Notes
          </CardTitle>
          <CardDescription>Search and filter notes by course or content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search notes by title, type, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {(search || selectedCourse) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing {filteredNotes.length} of {notes.length} notes
          </span>
          {(search || selectedCourse) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setSelectedCourse("")
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Found</h3>
            <p className="text-gray-600 max-w-md">
              {search || selectedCourse
                ? "Try adjusting your search criteria or filters."
                : "No study notes are available at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note._id} className="group hover:shadow-lg transition-all duration-200 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <Badge variant="secondary" className="text-xs">
                      {note.fileType?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight text-gray-900 group-hover:text-gray-700 transition-colors">
                  {note.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  <span className="font-medium">{note.courseId.name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="font-mono">{note.courseId.code}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* File Preview */}
                <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border">
                  <iframe src={note.fileUrl} className="w-full h-full" title={note.title} loading="lazy" />
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(note.fileUrl, note.title)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Note
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
