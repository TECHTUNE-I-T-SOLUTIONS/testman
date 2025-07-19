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
      <div className="min-h-screen bg-gray-50/50 dark:bg-neutral-900 transition-colors">
        <Header title="Manage Announcements" />
        <div className="max-w-6xl mx-auto p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="animate-pulse bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-gray-200 dark:bg-neutral-700 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-neutral-700 h-3 rounded w-full"></div>
                    <div className="bg-gray-200 dark:bg-neutral-700 h-3 rounded w-2/3"></div>
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-neutral-900 transition-colors">
      <Header title="Manage Announcements" />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Filter Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Announcements</SelectItem>
                    <SelectItem value="visible" className="text-gray-900 dark:text-gray-100">Visible to Students</SelectItem>
                    <SelectItem value="hidden" className="text-gray-900 dark:text-gray-100">Hidden from Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{announcements.length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{announcements.filter((a) => a.show).length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Visible</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <EyeOff className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{announcements.filter((a) => !a.show).length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Hidden</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {announcements.filter((a) => isExpired(a.createdAt, a.duration)).length}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No announcements found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                <Card
                  key={announcement._id}
                  className="hover:shadow-md transition-shadow bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={announcement.show ? "default" : "secondary"}
                              className={`text-xs ${announcement.show
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {announcement.show ? "Visible" : "Hidden"}
                            </Badge>
                            {expired && (
                              <Badge
                                variant="destructive"
                                className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              >
                                Expired
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">{announcement.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <span>Expires: {expiryDate.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVisibility(announcement._id, announcement.show)}
                            className="border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                          >
                            {announcement.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(announcement._id)}
                            className="border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
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
          <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Announcement</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Update the announcement content and duration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-content" className="text-gray-700 dark:text-gray-200">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[120px] resize-none bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground dark:text-gray-400 text-right">{editContent.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration" className="text-gray-700 dark:text-gray-200">Duration (Days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingId(null)}
                disabled={loading}
                className="border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                disabled={loading || !editContent || editDuration <= 0}
                className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
              >
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
