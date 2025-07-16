"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Edit, Trash2, Eye, EyeOff, Calendar, Clock, Search, Filter, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/dashboard/Header"

interface Announcement {
  _id: string
  content: string
  duration: number
  createdAt: string
  show: boolean
}

export default function ViewAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editDuration, setEditDuration] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/announcements")
      const data = await res.json()
      setAnnouncements(data)
      setFilteredAnnouncements(data)
    } catch (err) {
      console.log(err)
      toast.error("Failed to load announcements")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    let filtered = announcements

    // Filter by search term
    if (search) {
      filtered = filtered.filter((announcement) => announcement.content.toLowerCase().includes(search.toLowerCase()))
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isVisible = statusFilter === "visible"
      filtered = filtered.filter((announcement) => announcement.show === isVisible)
    }

    setFilteredAnnouncements(filtered)
  }, [announcements, search, statusFilter])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Announcement deleted")
        fetchAnnouncements()
      } else {
        toast.error("Failed to delete")
      }
    } catch (err) {
      console.log(err)
      toast.error("Failed to delete")
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement._id)
    setEditContent(announcement.content)
    setEditDuration(announcement.duration)
  }

  const saveEdit = async () => {
    if (!editContent || editDuration <= 0) {
      toast.error("Please provide valid content and duration")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/announcements/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          duration: editDuration,
        }),
      })

      if (res.ok) {
        toast.success("Announcement updated")
        setEditingId(null)
        fetchAnnouncements()
      } else {
        toast.error("Update failed")
      }
    } catch (err) {
      console.log(err)
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          show: !current,
        }),
      })

      if (res.ok) {
        toast.success(`Announcement ${current ? "hidden" : "made visible"}`)
        fetchAnnouncements()
      } else {
        toast.error("Toggle failed")
      }
    } catch (err) {
      console.log(err)
      toast.error("Toggle failed")
    }
  }

  const getExpiryDate = (createdAt: string, duration: number) => {
    const created = new Date(createdAt)
    const expiry = new Date(created.getTime() + duration * 24 * 60 * 60 * 1000)
    return expiry
  }

  const isExpired = (createdAt: string, duration: number) => {
    return getExpiryDate(createdAt, duration) < new Date()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header title="Manage Announcements" />
        <div className="max-w-6xl mx-auto p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-full"></div>
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
      <Header title="Manage Announcements" />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Announcements</SelectItem>
                    <SelectItem value="visible">Visible to Students</SelectItem>
                    <SelectItem value="hidden">Hidden from Students</SelectItem>
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
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{announcements.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{announcements.filter((a) => a.show).length}</p>
                  <p className="text-sm text-muted-foreground">Visible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <EyeOff className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{announcements.filter((a) => !a.show).length}</p>
                  <p className="text-sm text-muted-foreground">Hidden</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {announcements.filter((a) => isExpired(a.createdAt, a.duration)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600 mb-4">
                {announcements.length === 0
                  ? "You haven't created any announcements yet."
                  : "No announcements match your current filters."}
              </p>
              <Button asChild>
                <a href="/dashboard/super-admin/announcements/create">Create Your First Announcement</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const expired = isExpired(announcement.createdAt, announcement.duration)
              const expiryDate = getExpiryDate(announcement.createdAt, announcement.duration)

              return (
                <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={announcement.show ? "default" : "secondary"} className="text-xs">
                              {announcement.show ? "Visible" : "Hidden"}
                            </Badge>
                            {expired && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{announcement.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Expires: {expiryDate.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVisibility(announcement._id, announcement.show)}
                          >
                            {announcement.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(announcement._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>Update the announcement content and duration</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground text-right">{editContent.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (Days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingId(null)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={loading || !editContent || editDuration <= 0}>
                {loading ? (
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
