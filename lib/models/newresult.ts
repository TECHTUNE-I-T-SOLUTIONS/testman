import mongoose, { Schema, models } from "mongoose";

const AnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: "Question" },
  question: String,
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  correctAnswer: String,
  studentAnswer: String,
  isCorrect: Boolean,
});

const NewResultSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  answers: [AnswerSchema],
  createdAt: { type: Date, default: Date.now },
});

const NewResult =
  models.NewResult || mongoose.model("NewResult", NewResultSchema);
export default NewResult;
