import mongoose, { Schema, models } from "mongoose";


const ResultSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, ref: "Question" },
      question: String,
      correctAnswer: String,
      studentAnswer: String,
      isCorrect: Boolean,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Result = models.Result || mongoose.model("Result", ResultSchema);
export default Result;
