import { Option } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

interface Question extends Document {
  courseId: mongoose.Types.ObjectId;
  questionText: string;
  options: Option[];
  isSelectedForExam: boolean;
  createdAt: Date;
}

const QuestionSchema = new Schema<Question>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    questionText: { type: String, required: true },
    options: [{ text: { type: String, required: true }, isCorrect: Boolean }],
    isSelectedForExam: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Assign to a variable
const QuestionModel = mongoose.models.Question || mongoose.model<Question>("Question", QuestionSchema);

// ✅ Export the model with a name
export default QuestionModel;
