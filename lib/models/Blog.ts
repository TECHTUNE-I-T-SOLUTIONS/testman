// lib/models/Blog.ts
import mongoose, { Schema, Document } from "mongoose";

interface Comment {
  user: string;
  text: string;
  createdAt: Date;
}

interface Blog extends Document {
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  likes: number;
  shares: number;
}

const CommentSchema = new Schema<Comment>({
  user: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, required: true }
});

const BlogSchema = new Schema<Blog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: false,
    },
    comments: { type: [CommentSchema], default: [] },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model<Blog>("Blog", BlogSchema);
