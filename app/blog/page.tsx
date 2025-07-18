"use client"

import { useEffect, useRef, useState } from "react"
import { getStudentFromToken } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { Heart, Share2, MessageCircle, Calendar, Send, ExternalLink, BookOpen, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Navbar from "@/components/shared/Navbar"
import Image from "next/image"
import { FaWhatsapp, FaFacebook, FaTwitter, FaCopy } from "react-icons/fa"

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
  mediaType?: "image" | "video"
  createdAt: string
  comments: Comment[]
  likes: number
  shares: number
}

export default function BlogPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [newComment, setNewComment] = useState("")
  const [user, setUser] = useState<{ name: string; matricNumber: string } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Fetch logged in student info from token/session
  useEffect(() => {
    async function fetchStudent() {
      try {
        const tokenStudent = await getStudentFromToken()
        if (!tokenStudent?.matricNumber) return router.push("/auth/login")
        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber)
        const res = await fetch(`/api/students/${encodedMatric}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch student")
        setUser({ name: data.name, matricNumber: data.matricNumber })
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error fetching student:", error)
      }
    }
    fetchStudent()
  }, [router])

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/blog")
        const data = await res.json()
        setBlogs(data)
        setFilteredBlogs(data)
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  // Filter blogs based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBlogs(blogs)
    } else {
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBlogs(filtered)
    }
  }, [searchQuery, blogs])

  // Likes
  const handleLike = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    })
    if (res.ok) {
      const updatedBlog = await res.json()
      setBlogs((prev) => prev.map((b) => (b._id === id ? updatedBlog : b)))
      if (selectedBlog && selectedBlog._id === id) setSelectedBlog(updatedBlog)
    }
  }

  // Shares
  const handleShare = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    })
    if (res.ok) {
      const updatedBlog = await res.json()
      setBlogs((prev) => prev.map((b) => (b._id === id ? updatedBlog : b)))
      if (selectedBlog && selectedBlog._id === id) setSelectedBlog(updatedBlog)
    }
  }

  // Submit comment
  const handleCommentSubmit = async () => {
    if (!selectedBlog || !newComment.trim() || !user) return
    const res = await fetch(`/api/blog/${selectedBlog._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", user: user.name, text: newComment }),
    })
    if (res.ok) {
      const updatedBlog = await res.json()
      setBlogs((prev) => prev.map((b) => (b._id === selectedBlog._id ? updatedBlog : b)))
      setSelectedBlog(updatedBlog)
      setNewComment("")
    }
  }

  // Share to platforms
  const shareToPlatform = (blog: Blog, platform: string) => {
    const url = `${window.location.origin}/blog/${blog._id}`
    const title = encodeURIComponent(blog.title)
    const shareUrlMap: { [key: string]: string } = {
      whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    }
    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } else if (shareUrlMap[platform]) {
      window.open(shareUrlMap[platform], "_blank")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gray-900 dark:bg-gray-800 rounded-full">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Latest Blog Posts</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest insights, tips, and stories from the Operation Save My CGPA community.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search and Filter */}
          <Card className="mb-8 dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Find the blog posts you&apos;re looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Blog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse dark:bg-gray-900 dark:border-gray-800">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Blog Posts Found</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  {searchQuery ? "Try adjusting your search terms." : "No blog posts are available at the moment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog._id}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden dark:bg-gray-900 dark:border-gray-800"
                  onClick={() => setSelectedBlog(blog)}
                >
                  {/* Media */}
                  {blog.mediaUrl && (
                    <div className="relative h-48 overflow-hidden">
                      {blog.mediaType === "image" ? (
                        <Image
                          src={blog.mediaUrl || "/placeholder.svg"}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <video src={blog.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {blog.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">{stripHtml(blog.content)}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{blog.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{blog.comments.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          <span>{blog.shares}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Read More
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blog Modal */}
          {selectedBlog && (
            <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold pr-8 dark:text-white">{selectedBlog.title}</DialogTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Media */}
                  {selectedBlog.mediaUrl && (
                    <div className="relative rounded-lg overflow-hidden">
                      {selectedBlog.mediaType === "image" ? (
                        <Image
                          src={selectedBlog.mediaUrl || "/placeholder.svg"}
                          alt={selectedBlog.title}
                          width={800}
                          height={400}
                          className="w-full max-h-96 object-cover"
                        />
                      ) : (
                        <video
                          src={selectedBlog.mediaUrl}
                          className="w-full max-h-96 object-cover"
                          controls
                          autoPlay
                          muted
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="prose prose-gray max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      onClick={() => handleLike(selectedBlog._id)}
                      variant="outline"
                      className="flex items-center gap-2 dark:border-gray-700 dark:text-white"
                    >
                      <Heart className="h-4 w-4" />
                      Like ({selectedBlog.likes})
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          onClick={() => handleShare(selectedBlog._id)}
                          variant="outline"
                          className="flex items-center gap-2 dark:border-gray-700 dark:text-white"
                        >
                          <Share2 className="h-4 w-4" />
                          Share ({selectedBlog.shares})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="dark:bg-gray-900 dark:border-gray-800">
                        <DropdownMenuItem onClick={() => shareToPlatform(selectedBlog, "whatsapp")} className="dark:text-white">
                          <FaWhatsapp className="mr-2 h-4 w-4" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareToPlatform(selectedBlog, "facebook")} className="dark:text-white">
                          <FaFacebook className="mr-2 h-4 w-4" />
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareToPlatform(selectedBlog, "x")} className="dark:text-white">
                          <FaTwitter className="mr-2 h-4 w-4" />X (Twitter)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareToPlatform(selectedBlog, "copy")} className="dark:text-white">
                          <FaCopy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: selectedBlog.title,
                            text: "Check out this blog post!",
                            url: `${window.location.origin}/blog/${selectedBlog._id}`,
                          })
                        } else {
                          alert("Sharing not supported on this device.")
                        }
                      }}
                      variant="outline"
                      className="flex items-center gap-2 dark:border-gray-700 dark:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share via Device
                    </Button>
                  </div>

                  <Separator className="dark:bg-gray-800" />

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                      <MessageCircle className="h-5 w-5" />
                      Comments ({selectedBlog.comments.length})
                    </h3>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {selectedBlog.comments.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>
                      ) : (
                        selectedBlog.comments.map((comment, idx) => (
                          <div key={idx} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs dark:bg-gray-700 dark:text-white">
                                {comment.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm dark:text-white">{comment.user}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-200">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    {user && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                        />
                        <Button
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim()}
                          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Comment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  )
}
