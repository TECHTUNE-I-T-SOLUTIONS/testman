"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, Plus, ImageIcon, Calendar, Eye, EyeOff, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/dashboard/Header"

export default function CreateAdPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [link, setLink] = useState("")
  const [duration, setDuration] = useState("")
  const [status, setStatus] = useState("active")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP)")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const handleSubmit = async () => {
    if (!title || !description || !imageFile || !duration) {
      toast.error("Please fill all required fields and upload an image")
      return
    }

    if (Number.parseInt(duration) <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    try {
      setLoading(true)

      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Image = reader.result?.toString()
        if (!base64Image) {
          toast.error("Failed to process image")
          return
        }

        try {
          const res = await fetch("/api/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              imageUrl: base64Image,
              link: link || null,
              duration: Number(duration),
              status,
              priority,
            }),
          })

          if (res.ok) {
            toast.success("Advertisement created successfully!")
            router.push("/dashboard/super-admin/manage-ads/view")
          } else {
            const err = await res.json()
            toast.error(err.error || "Failed to create advertisement")
          }
        } catch (error) {
          toast.error("Something went wrong")
          console.error(error)
        } finally {
          setLoading(false)
        }
      }

      reader.readAsDataURL(imageFile)
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
      setLoading(false)
    }
  }

  const previewDays = duration ? Number.parseInt(duration) : 0
  const expiryDate = previewDays > 0 ? new Date(Date.now() + previewDays * 24 * 60 * 60 * 1000) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 transition-colors duration-300">
      <Header title="Create Advertisement" />

      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6">
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Plus className="h-5 w-5" />
              New Advertisement
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Create a new advertisement to display to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Advertisement Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter advertisement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
                />
                <p className="text-sm text-muted-foreground text-right">{title.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-gray-900 dark:text-gray-100">Link URL (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
                />
                <p className="text-sm text-muted-foreground">Where should users go when they click the ad?</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter advertisement description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
                maxLength={300}
              />
              <p className="text-sm text-muted-foreground text-right">{description.length}/300 characters</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">Advertisement Image *</Label>
              {!imagePreview ? (
                <div className="relative border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 dark:hover:border-neutral-500 transition-colors bg-gray-50 dark:bg-neutral-800">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WebP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Advertisement preview"
                    className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-900 dark:text-gray-100">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="365"
                  className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700">
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700">
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            {title && description && imagePreview && (
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Advertisement Preview</Label>
                <Card className="max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt={title}
                        className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={status === "active" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {status}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {priority} priority
                        </Badge>
                      </div>
                      {expiryDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {expiryDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !title || !description || !imageFile || !duration}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900 mr-2" />
                  Creating Advertisement...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Advertisement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
