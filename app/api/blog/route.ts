// app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Blog from "@/lib/models/Blog";
import sanitizeHtml from "sanitize-html";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { randomUUID } from "crypto";

interface BlogData {
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  comments: Comment[];
  likes: number;
  shares: number;
}

export async function GET() {
  await connectdb();
  const blogs = await Blog.find().sort({ createdAt: -1 });
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  try {
    await connectdb();

    const contentType = req.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string | null;
      const content = formData.get("content") as string | null;

      if (!title || !content) {
        return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
      }

      let mediaUrl;
      let mediaType: "image" | "video" | undefined;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = path.extname(file.name);
        const fileName = `${randomUUID()}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        mediaUrl = `/uploads/${fileName}`;
        const mime = file.type;
        if (mime.startsWith("image")) mediaType = "image";
        else if (mime.startsWith("video")) mediaType = "video";
      }

      const cleanContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "width", "height"],
          a: ["href", "name", "target", "rel"],
        },
      });

      const blogData: BlogData = {
        title,
        content: cleanContent,
        mediaUrl,
        mediaType,
        comments: [],
        likes: 0,
        shares: 0,
      };

      const newBlog = new Blog(blogData);
      await newBlog.save();

      return NextResponse.json({ message: "Blog created", blog: newBlog }, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Unsupported content type. Must be multipart/form-data." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Blog creation error:", error);
      return NextResponse.json({ message: "Failed to create blog post", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Unknown error occurred." }, { status: 500 });
  }
}
