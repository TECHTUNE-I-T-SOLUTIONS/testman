import mongoose, { Schema, Document } from "mongoose";


interface Exam extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  questions: mongoose.Types.ObjectId[]; 
  duration: number;
  scheduledTime?: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const ExamSchema = new Schema<Exam>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    questions: [
      { type: Schema.Types.ObjectId, ref: "Question", required: true }, // ✅ Ensure this key matches in DB
    ],
    duration: { type: Number, required: true },
    scheduledTime: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Exam =  mongoose.models.Exam || mongoose.model<Exam>("Exam", ExamSchema);
export default Exam