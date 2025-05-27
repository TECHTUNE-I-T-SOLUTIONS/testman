// /lib/models/Announcement.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  content: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  show: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    content: { type: String, required: true },
    duration: { type: Number, required: true },
    show: { type: Boolean, default: true }, // 👈 NEW
  },
  { timestamps: true }
);

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
