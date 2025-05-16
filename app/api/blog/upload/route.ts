// app/api/blog/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { connectdb } from '@/lib/connectdb';
import Blog from '@/lib/models/Blog';

export async function POST(req: Request) {
  try {
    await connectdb();

    const formData = await req.formData();

    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!file || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle file upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const mediaUrl = `/uploads/${fileName}`;
    const mediaType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : undefined;

    // Save blog to MongoDB
    const newBlog = await Blog.create({
      title,
      content,
      mediaUrl,
      mediaType,
      comments: [],
      likes: 0,
      shares: 0
    });

    return NextResponse.json({ message: 'Blog post uploaded successfully', blog: newBlog }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
