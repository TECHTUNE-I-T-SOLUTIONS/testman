"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Trash2, Eye, EyeOff, Calendar, ImageIcon, ExternalLink, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/dashboard/Header"

interface Ad {
  _id: string
  title: string
  description: string
  imageUrl: string
  link?: string
  duration: number
  status: "active" | "inactive"
  priority: "high" | "medium" | "low"
  createdAt: string
  clicks?: number
  views?: number
}

export default function ViewAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [filteredAds, setFilteredAds] = useState<Ad[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAds = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/ads")
      const data = await res.json()

      if (Array.isArray(data)) {
        setAds(data)
        setFilteredAds(data)
      } else {
        setAds([])
        setFilteredAds([])
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to load advertisements")
      setAds([])
      setFilteredAds([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  useEffect(() => {
    let filtered = ads

    if (search) {
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(search.toLowerCase()) ||
          ad.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ad) => ad.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((ad) => ad.priority === priorityFilter)
    }

    setFilteredAds(filtered)
  }, [ads, search, statusFilter, priorityFilter])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Advertisement deleted successfully")
        fetchAds()
      } else {
        toast.error("Failed to delete advertisement")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete advertisement")
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(`Advertisement ${newStatus === "active" ? "activated" : "deactivated"}`)
        fetchAds()
      } else {
        toast.error("Failed to update advertisement status")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update advertisement status")
    }
  }

  const getExpiryDate = (createdAt: string, duration: number) => {
    const created = new Date(createdAt)
    const expiry = new Date(created.getTime() + duration * 24 * 60 * 60 * 1000)
    return expiry
  }

  const isExpired = (create: string, duration: number) => {
    return getExpiryDate(create, duration) < new Date()
  }

  // Responsive and theme-aware priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors">
        <Header title="Manage Advertisements" />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="bg-gray-200 dark:bg-gray-700 h-40 sm:h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-full"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors">
      <Header title="Manage Advertisements" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Filter className="h-5 w-5" />
              Filter Advertisements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search by title or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-200">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ads.length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Total Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ads.filter((ad) => ad.status === "active").length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Active Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <EyeOff className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ads.filter((ad) => ad.status === "inactive").length}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Inactive Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {ads.filter((ad) => isExpired(ad.createdAt, ad.duration)).length}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Expired Ads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advertisements Grid */}
        {filteredAds.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 sm:p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No advertisements found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {ads.length === 0
                  ? "You haven't created any advertisements yet."
                  : "No advertisements match your current filters."}
              </p>
              <Button asChild>
                <a href="/dashboard/super-admin/manage-ads/create">Create Your First Ad</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAds.map((ad) => {
              const expired = isExpired(ad.createdAt, ad.duration)
              const expiryDate = getExpiryDate(ad.createdAt, ad.duration)

              return (
                <Card
                  key={ad._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative">
                    <img
                      src={ad.imageUrl || "/placeholder.svg"}
                      alt={ad.title}
                      className="w-full h-40 sm:h-48 object-cover bg-gray-100 dark:bg-gray-900"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge
                        variant={ad.status === "active" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {ad.status}
                      </Badge>
                      {expired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-gray-100">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">{ad.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`text-xs ${getPriorityColor(ad.priority)}`}>{ad.priority} priority</Badge>
                        {ad.link && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Has Link
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground dark:text-gray-400 space-y-1">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {expiryDate.toLocaleDateString()}
                        </p>
                        <p>Created: {new Date(ad.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAd(ad)
                            setPreviewOpen(true)
                          }}
                          className="w-full sm:w-auto"
                        >
                          Preview
                        </Button>

                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => toggleStatus(ad._id, ad.status)}>
                            {ad.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ad._id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-lg sm:max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Advertisement Preview</DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300">
                How this advertisement appears to students
              </DialogDescription>
            </DialogHeader>

            {selectedAd && (
              <div className="space-y-4">
                <img
                  src={selectedAd.imageUrl || "/placeholder.svg"}
                  alt={selectedAd.title}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
                />

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedAd.title}</h3>
                  <p className="text-muted-foreground dark:text-gray-400">{selectedAd.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={selectedAd.status === "active" ? "default" : "secondary"} className="capitalize">
                    {selectedAd.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedAd.priority)}>{selectedAd.priority} priority</Badge>
                  {isExpired(selectedAd.createdAt, selectedAd.duration) && <Badge variant="destructive">Expired</Badge>}
                </div>

                {selectedAd.link && (
                  <Alert className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription className="text-gray-700 dark:text-gray-200">
                      Clicking this ad will redirect users to:{" "}
                      <a
                        href={selectedAd.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {selectedAd.link}
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground dark:text-gray-400 space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p>Created: {new Date(selectedAd.createdAt).toLocaleDateString()}</p>
                  <p>Expires: {getExpiryDate(selectedAd.createdAt, selectedAd.duration).toLocaleDateString()}</p>
                  {selectedAd.views && <p>Views: {selectedAd.views.toLocaleString()}</p>}
                  {selectedAd.clicks && <p>Clicks: {selectedAd.clicks.toLocaleString()}</p>}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
