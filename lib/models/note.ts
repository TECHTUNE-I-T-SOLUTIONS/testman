import mongoose, { Schema, Document } from "mongoose";

interface Note extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

const NoteSchema = new Schema<Note>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "txt", "doc", "docx"], required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<Note>("Note", NoteSchema);
