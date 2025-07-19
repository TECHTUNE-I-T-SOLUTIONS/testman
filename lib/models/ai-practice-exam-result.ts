import mongoose, { Schema, type Document } from "mongoose"

/* ───────────────── Interfaces ──────────────────── */
export interface IAnswer {
  questionText: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface IAIPracticeExamResult extends Document {
  examId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  score: number
  totalQuestions: number
  percentage: number
  duration: number
  timeTaken: number
  answers: IAnswer[]
  startedAt: Date
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

/* ───────────────── Schemas ─────────────────────── */
const AnswerSchema = new Schema<IAnswer>({
  questionText: { type: String, required: true },
  studentAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
})

const AIPracticeExamResultSchema = new Schema<IAIPracticeExamResult>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "AIPracticeExam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    duration: { type: Number, required: true }, // exam duration in minutes
    timeTaken: { type: Number, required: true }, // actual time taken in minutes
    answers: [AnswerSchema],
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true },
)

AIPracticeExamResultSchema.index({ examId: 1, studentId: 1 })
AIPracticeExamResultSchema.index({ studentId: 1, createdAt: -1 })
AIPracticeExamResultSchema.index({ examId: 1, createdAt: -1 })
AIPracticeExamResultSchema.index({ percentage: 1 })

const AIPracticeExamResult =
  mongoose.models.AIPracticeExamResult ||
  mongoose.model<IAIPracticeExamResult>("AIPracticeExamResult", AIPracticeExamResultSchema)

export default AIPracticeExamResult 