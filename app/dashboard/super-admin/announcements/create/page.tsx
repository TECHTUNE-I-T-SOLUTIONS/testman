"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Calendar, Eye, EyeOff, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/dashboard/Header"

export default function CreateAnnouncementPage() {
  const [content, setContent] = useState("")
  const [duration, setDuration] = useState("")
  const [show, setShow] = useState("yes")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!content || !duration || !show) {
      toast.error("Please fill all fields")
      return
    }

    if (Number(duration) <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          duration: Number(duration),
          show: show === "yes",
        }),
      })

      if (res.ok) {
        toast.success("Announcement created successfully!")
        router.push("/dashboard/super-admin/announcements/view")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create announcement")
      }
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const previewDays = duration ? Number(duration) : 0
  const expiryDate = previewDays > 0 ? new Date(Date.now() + previewDays * 24 * 60 * 60 * 1000) : null

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header title="Create Announcement" />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Announcement
            </CardTitle>
            <CardDescription>Create a new announcement to display to students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Announcement Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your announcement message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Write a clear and concise message for students</span>
                <span>{content.length}/500 characters</span>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 7"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="365"
                />
                <p className="text-sm text-muted-foreground">How long should this announcement be visible?</p>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={show} onValueChange={setShow}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visible to Students
                      </div>
                    </SelectItem>
                    <SelectItem value="no">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Hidden from Students
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {show === "yes" ? "Students will see this announcement" : "This will be saved as draft"}
                </p>
              </div>
            </div>

            {/* Preview */}
            {content && (
              <div className="space-y-2">
                <Label>Announcement Preview</Label>
                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Student Announcement
                        </Badge>
                        <Badge variant={show === "yes" ? "default" : "secondary"} className="text-xs">
                          {show === "yes" ? "Visible" : "Hidden"}
                        </Badge>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm leading-relaxed">{content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Posted: {new Date().toLocaleDateString()}</span>
                        </div>
                        {expiryDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Expires: {expiryDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Duration Info */}
            {duration && Number(duration) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Duration Information</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    • This announcement will be visible for <strong>{duration} day(s)</strong>
                  </p>
                  {expiryDate && (
                    <p>
                      • It will automatically expire on <strong>{expiryDate.toLocaleDateString()}</strong>
                    </p>
                  )}
                  <p>• Students will see this in their dashboard and notifications</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button onClick={handleSubmit} disabled={loading || !content || !duration} className="w-full" size="lg">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Announcement...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
