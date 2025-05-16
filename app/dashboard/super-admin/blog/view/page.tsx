"use client";

import React, { useEffect, useState } from "react";
import Editor from "@/components/Editor";
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
  mediaType?: string;
  likes?: number;
  shares?: number;
  comments?: Comment[];
}

export default function BlogViewPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error fetching blogs");
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  function startEditing(blog: Blog) {
    setEditingBlog(blog);
    setShowModal(true);
  }

  function confirmDelete(blog: Blog) {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  }

  async function deleteBlogConfirmed() {
    if (!blogToDelete) return;
    try {
      const res = await fetch(`/api/blog/${blogToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogs((prev) => prev.filter((b) => b._id !== blogToDelete._id));
      closeDeleteModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete blog");
      } else {
        setError("Unknown error occurred");
      }
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  }

  async function saveEdit(updatedContent: string, updatedTitle: string) {
    if (!editingBlog) return;
    try {
      const res = await fetch(`/api/blog/${editingBlog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
          mediaUrl: editingBlog.mediaUrl || "",
          mediaType: editingBlog.mediaType || "",
        }),
      });
      if (!res.ok) throw new Error("Failed to update blog");
      const updated = await res.json();
      setBlogs((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update blog");
      } else {
        setError("Unknown error occurred");
      }
    }
  }

  function closeModal() {
    setShowModal(false);
    setEditingBlog(null);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Blog Posts</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {blogs.length === 0 && !loading && <p>No blog posts found.</p>}

      <ul className="space-y-6">
      {blogs.map((blog) => (
        <li key={blog._id} className="bg-white border p-4 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
          <div className="text-sm text-gray-600 mb-2">
            <span className="mr-4">👍 {blog.likes || 0} Likes</span>
            <span className="mr-4">🔁 {blog.shares || 0} Shares</span>
            <span>💬 {blog.comments?.length || 0} Comments</span>
          </div>
          <div
            className="prose prose-sm max-w-none mb-3"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Media preview */}
          {blog.mediaUrl && (
            <div className="mb-3">
              {blog.mediaType === "image" && (
                <Image
                  src={blog.mediaUrl}
                  alt={blog.title}
                  width={200} // adjust dimensions accordingly
                  height={200}
                  className="rounded"
                />
              )}
              {blog.mediaType === "video" && (
                <video controls className="max-w-sm rounded">
                  <source src={blog.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}


          <div className="flex space-x-3">
            <button
              onClick={() => startEditing(blog)}
              className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500"
            >
              Edit
            </button>
            <button
              onClick={() => confirmDelete(blog)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      </ul>

      {/* Edit Modal */}
      {showModal && editingBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80 sm:w-auto md:w-auto lg:w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeInUp">
            <h2 className="text-xl font-bold mb-4">Edit Blog Post</h2>
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Likes:</strong> {editingBlog.likes || 0}</p>
              <p><strong>Shares:</strong> {editingBlog.shares || 0}</p>
              <p><strong>Comments:</strong> {editingBlog.comments?.length || 0}</p>
            </div>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              value={editingBlog.title}
              onChange={(e) =>
                setEditingBlog({ ...editingBlog, title: e.target.value })
              }
            />
            <Editor
              content={editingBlog.content}
              setContent={(val: string) =>
                setEditingBlog({ ...editingBlog, content: val })
              }
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() =>
                  saveEdit(editingBlog.content, editingBlog.title)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-3">Confirm Deletion</h2>
            <p className="mb-5 text-gray-600">Are you sure you want to delete <strong>&ldquo;{blogToDelete.title}&ldquo;</strong> post?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={deleteBlogConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
