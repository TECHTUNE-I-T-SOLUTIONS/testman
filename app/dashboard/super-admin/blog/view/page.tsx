"use client"

import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Heart, Share2, MessageCircle, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Editor from "@/components/Editor"
import Image from "next/image"

interface Comment {
  user: string
  text: string
  createdAt: string
}

interface Blog {
  _id: string
  title: string
  content: string
  mediaUrl?: string
  mediaType?: string
  likes?: number
  shares?: number
  comments?: Comment[]
}

export default function BlogViewPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  async function fetchBlogs() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/blog")
      if (!res.ok) throw new Error("Failed to fetch blogs")
      const data = await res.json()
      setBlogs(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error fetching blogs")
      } else {
        setError("Unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  function startEditing(blog: Blog) {
    setEditingBlog({ ...blog })
    setShowModal(true)
  }

  function confirmDelete(blog: Blog) {
    setBlogToDelete(blog)
    setShowDeleteModal(true)
  }

  async function deleteBlogConfirmed() {
    if (!blogToDelete) return

    try {
      const res = await fetch(`/api/blog/${blogToDelete._id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete blog")

      setBlogs((prev) => prev.filter((b) => b._id !== blogToDelete._id))
      toast.success("Blog post deleted successfully")
      closeDeleteModal()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete blog")
        toast.error("Failed to delete blog post")
      } else {
        setError("Unknown error occurred")
        toast.error("An unexpected error occurred")
      }
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false)
    setBlogToDelete(null)
  }

  async function saveEdit() {
    if (!editingBlog) return

    try {
      setSaving(true)
      const res = await fetch(`/api/blog/${editingBlog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingBlog.title,
          content: editingBlog.content,
          mediaUrl: editingBlog.mediaUrl || "",
          mediaType: editingBlog.mediaType || "",
        }),
      })

      if (!res.ok) throw new Error("Failed to update blog")

      const updated = await res.json()
      setBlogs((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
      toast.success("Blog post updated successfully")
      closeModal()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update blog")
        toast.error("Failed to update blog post")
      } else {
        setError("Unknown error occurred")
        toast.error("An unexpected error occurred")
      }
    } finally {
      setSaving(false)
    }
  }

  function closeModal() {
    setShowModal(false)
    setEditingBlog(null)
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            Manage Blog Posts
          </h1>
          <p className="text-muted-foreground mt-1">View, edit, and manage your published blog content</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {blogs.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium">No Blog Posts Found</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                You haven&apos;t created any blog posts yet. Start by creating your first post.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {blogs.map((blog) => (
          <Card key={blog._id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{blog.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{blog.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>{blog.shares || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{blog.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(blog)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => confirmDelete(blog)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none mb-4" dangerouslySetInnerHTML={{ __html: blog.content }} />

              {/* Media preview */}
              {blog.mediaUrl && (
                <div className="mt-4">
                  {blog.mediaType === "image" && (
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      <Image
                        src={blog.mediaUrl || "/placeholder.svg"}
                        alt={blog.title}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  {blog.mediaType === "video" && (
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      <video controls className="w-full h-auto">
                        <source src={blog.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Make changes to your blog post content and settings</DialogDescription>
          </DialogHeader>

          {editingBlog && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{editingBlog.likes || 0} Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>{editingBlog.shares || 0} Shares</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{editingBlog.comments?.length || 0} Comments</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Editor
                  content={editingBlog.content}
                  setContent={(val: string) => setEditingBlog({ ...editingBlog, content: val })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{blogToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteBlogConfirmed}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
