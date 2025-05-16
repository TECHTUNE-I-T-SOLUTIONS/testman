"use client";

import React, { useEffect, useRef, useState } from "react";
import { getStudentFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Menu, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Comment {
  user: string;
  text: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  comments: Comment[];
  likes: number;
  shares: number;
}

export default function BlogPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<{ name: string; matricNumber: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch logged in student info from token/session
  useEffect(() => {
    async function fetchStudent() {
      try {
        const tokenStudent = await getStudentFromToken();
        if (!tokenStudent?.matricNumber) return router.push("/auth/login");

        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber);
        const res = await fetch(`/api/students/${encodedMatric}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch student");

        setUser({ name: data.name, matricNumber: data.matricNumber });
      } catch (error) {
        console.error("Error fetching student:", error);
      }
    }
    fetchStudent();
  }, [router]);

  useEffect(() => {
    // Example: Check localStorage or session for auth token
    const getToken = async () => {
      const token = await getStudentFromToken()
      getStudentFromToken()
      setIsLoggedIn(!!token);
    }
    getToken();
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await fetch("/api/blog");
      const data = await res.json();
      setBlogs(data);
    };
    fetchBlogs();
  }, []);

  // Likes
  const handleLike = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    });
    if (res.ok) {
      const updatedBlog = await res.json();
      setBlogs((prev) => prev.map((b) => (b._id === id ? updatedBlog : b)));
      if (selectedBlog && selectedBlog._id === id) setSelectedBlog(updatedBlog);
    }
  };

  // Shares
  const handleShare = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    });
    if (res.ok) {
      const updatedBlog = await res.json();
      setBlogs((prev) => prev.map((b) => (b._id === id ? updatedBlog : b)));
      if (selectedBlog && selectedBlog._id === id) setSelectedBlog(updatedBlog);
    }
  };

  // Submit comment
  const handleCommentSubmit = async () => {
    if (!selectedBlog || !newComment.trim() || !user) return;

    const res = await fetch(`/api/blog/${selectedBlog._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", user: user.name, text: newComment }),
    });
    if (res.ok) {
      const updatedBlog = await res.json();
      setBlogs((prev) => prev.map((b) => (b._id === selectedBlog._id ? updatedBlog : b)));
      setSelectedBlog(updatedBlog);
      setNewComment("");
    }
  };

  // share to platforms
  const shareToPlatform = (blog: Blog, platform: string) => {
    const url = `${window.location.origin}/blog/${blog._id}`;
    const title = encodeURIComponent(blog.title);
    const shareUrlMap: { [key: string]: string } = {
      whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      instagram: "", // Instagram doesn't support direct web shares
      tiktok: "", // TikTok also doesn't support direct web shares
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } else if (shareUrlMap[platform]) {
      window.open(shareUrlMap[platform], "_blank");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowShareDropdown(false);
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowShareDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);



  return (
    <>
      {/* Navbar */}    
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-4 pr-4">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/Operation-save-my-CGPA-07.svg"
              alt="Operation Save My CGPA Logo"
              width={30}
              height={30}
              className="h-15 w-15"
            />
            <span className="text-xl font-bold tracking-tight">
              Operation Save My CGPA
            </span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-2 mr-2">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Button asChild>
                <Link href="/student">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="ml-4 mr-4 md:hidden border-t">
            <div className="container py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>

              <div className="pt-2 border-t flex flex-col gap-2">
                {isLoggedIn ? (
                  <Button className="w-full" asChild>
                    <Link href="/student">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      <div className="p-6">
        <h1 className="text-center text-3xl font-bold mb-4">Latest Blog Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="border p-4 rounded shadow hover:shadow-lg cursor-pointer"
              onClick={() => setSelectedBlog(blog)}
            >
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              {blog.mediaUrl && blog.mediaType === "image" && (
              <Image
                src={blog.mediaUrl}
                alt={blog.title}
                width={800}
                height={300}
                className="w-full h-48 object-cover mt-2 rounded"
              />

              )}
              {blog.mediaUrl && blog.mediaType === "video" && (
                <video
                  src={blog.mediaUrl}
                  className="w-full h-48 object-cover mt-2 rounded"
                  muted
                  preload="metadata"
                  controls={false}
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              )}
              <div
                className="text-gray-600 mt-2 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 200) + "..." }}
              ></div>
              <div className="flex justify-between mt-3 text-sm text-gray-500">
                <span>👍 {blog.likes}</span>
                <span>💬 {blog.comments.length}</span>
                <span>🔄 {blog.shares}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            {/* Background Blur Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-6 animate-fade-in transform transition-all duration-300 scale-100 sm:scale-95 z-10">
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-4">{selectedBlog.title}</h2>

              {selectedBlog.mediaUrl && selectedBlog.mediaType === "image" && (
                <Image
                  src={selectedBlog.mediaUrl}
                  alt={selectedBlog.title}
                  width={800}
                  height={400}
                  className="w-full max-h-64 object-contain rounded mb-4"
                />
              )}

              {selectedBlog.mediaUrl && selectedBlog.mediaType === "video" && (
                <video
                  src={selectedBlog.mediaUrl}
                  className="w-full max-h-64 object-contain rounded mb-4"
                  controls
                  autoPlay
                  muted
                />
              )}

              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              ></div>

              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => handleLike(selectedBlog._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Like ({selectedBlog.likes})
                </button>
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => {
                      handleShare(selectedBlog._id); // optional if still needed
                      setShowShareDropdown(prev => !prev);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Share ({selectedBlog.shares})
                  </button>

                  {showShareDropdown && (
                    <div className="mt-2 bg-white border shadow-lg rounded-md absolute z-10 w-48">
                      <button
                        onClick={() => shareToPlatform(selectedBlog, "whatsapp")}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareToPlatform(selectedBlog, "facebook")}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => shareToPlatform(selectedBlog, "x")}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                      >
                        X (Twitter)
                      </button>
                      <button
                        onClick={() => shareToPlatform(selectedBlog, "copy")}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedBlog.title,
                        text: "Check out this blog post!",
                        url: `${window.location.origin}/blog/${selectedBlog._id}`,
                      });
                    } else {
                      alert("Sharing not supported on this device.");
                    }
                  }}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  Share via Device
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Comments</h3>
                <div className="max-h-40 overflow-y-auto border p-2 rounded mb-2">
                  {selectedBlog.comments.length === 0 && <p>No comments yet.</p>}
                  {selectedBlog.comments.map((comment, idx) => (
                    <div key={idx} className="border-b py-1 last:border-0">
                      <strong>{comment.user}</strong>{" "}
                      <span className="text-gray-500 text-xs">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>

                <textarea
                  className="w-full border rounded mt-2 p-2"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Submit Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
