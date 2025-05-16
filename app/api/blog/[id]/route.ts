// app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Blog from "@/lib/models/Blog";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectdb();
  const blog = await Blog.findById(params.id);
  if (!blog) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }
  return NextResponse.json(blog);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectdb();
  const { title, content, mediaUrl, mediaType } = await req.json();

  const updatedBlog = await Blog.findByIdAndUpdate(
    params.id,
    { title, content, mediaUrl, mediaType },
    { new: true }
  );

  if (!updatedBlog) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }

  return NextResponse.json(updatedBlog);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectdb();
  const { action, user, text } = await req.json();
  const blog = await Blog.findById(params.id);
  if (!blog) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }

  switch(action) {
    case "like":
      blog.likes = (blog.likes || 0) + 1;
      break;
    case "share":
      blog.shares = (blog.shares || 0) + 1;
      break;
    case "comment":
      if (!user || !text) {
        return NextResponse.json({ message: "User and text required for comments." }, { status: 400 });
      }
      blog.comments = blog.comments || [];
      blog.comments.push({ user, text, createdAt: new Date() });
      break;
    default:
      return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  }

  await blog.save();
  return NextResponse.json(blog);
}

// ADD THIS DELETE HANDLER:

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectdb();
  const deleted = await Blog.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ message: "Blog not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "Blog deleted successfully." });
}
