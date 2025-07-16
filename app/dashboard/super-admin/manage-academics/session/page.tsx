"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CalendarIcon, Pencil, Trash2, Plus, X, Loader2, Calendar, AlertCircle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface AcademicSession {
  _id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([])
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/session")
      if (!res.ok) throw new Error("Failed to fetch sessions")

      const data = await res.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      setError("Failed to load academic sessions. Please try again.")
      toast.error("Error fetching sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !startDate || !endDate) {
      toast.error("All fields are required!")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/session", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
      })

      if (res.ok) {
        toast.success(editingId ? "Session updated successfully!" : "Session created successfully!")
        resetForm()
        fetchSessions()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error saving session.")
      }
    } catch (error) {
      console.error("Error saving session:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setStartDate(undefined)
    setEndDate(undefined)
    setEditingId(null)
  }

  const handleEdit = (session: AcademicSession) => {
    setEditingId(session._id)
    setName(session.name)
    setStartDate(new Date(session.startDate))
    setEndDate(new Date(session.endDate))
  }

  const handleDeleteConfirmation = (id: string) => {
    setSessionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!sessionToDelete) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionToDelete }),
      })

      if (res.ok) {
        toast.success("Session deleted successfully!")
        fetchSessions()
      } else {
        toast.error("Error deleting session.")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session. Please try again.")
    } finally {
      setSubmitting(false)
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage academic years and semesters</p>
        </div>
        <Button onClick={resetForm} variant={editingId ? "outline" : "default"}>
          {editingId ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel Editing
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Session" : "Create New Session"}</CardTitle>
            <CardDescription>
              {editingId
                ? "Update the details of an existing academic session"
                : "Add a new academic year or semester to the system"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 2023/2024 Academic Year"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                      disabled={submitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                      disabled={submitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="session-form" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingId ? "Update Session" : "Create Session"}</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Sessions</CardTitle>
              <CardDescription>
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"} found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No sessions found</h3>
                  <p className="text-muted-foreground mt-1">Create your first academic session to get started</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {sessions.map((session) => (
                    <li key={session._id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.name}</h3>
                            {session.isActive && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="inline-flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {format(new Date(session.startDate), "PPP")}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="inline-flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {format(new Date(session.endDate), "PPP")}
                            </span>
                          </p>
                        </div>
                        <div className="flex space-x-2 self-end md:self-auto">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(session)} disabled={submitting}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConfirmation(session._id)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this academic session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

