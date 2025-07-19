import mongoose, { Schema, type Document } from "mongoose"

/* ───────────────── Interfaces ──────────────────── */
export interface IQuestion {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer"
  options?: string[]
  correctAnswer: string | boolean | string[]
  explanation?: string
  points: number
}

export interface IStudentAnswer {
  questionId: string
  answer: string | boolean | string[]
  isCorrect: boolean
  timeSpent: number
}

export interface IAIPracticeExam extends Document {
  studentId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  sessionId?: mongoose.Types.ObjectId
  title: string
  subject?: string
  questions: IQuestion[]
  duration: number
  status: "draft" | "active" | "completed" | "expired"
  isActive: boolean
  studentAnswers: IStudentAnswer[]
  materialIds: mongoose.Types.ObjectId[]
  score?: number
  percentage?: number
  timeSpent?: number
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/* ───────────────── Schemas ─────────────────────── */
const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer"],
    required: true,
  },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: String,
  points: { type: Number, default: 1 },
})

const StudentAnswerSchema = new Schema<IStudentAnswer>({
  questionId: { type: String, required: true },
  answer: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number, default: 0 },
})

const AIPracticeExamSchema = new Schema<IAIPracticeExam>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession" }, // optional
    title: { type: String, required: true },
    subject: String,
    questions: [QuestionSchema],
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "expired"],
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
    studentAnswers: [StudentAnswerSchema],
    materialIds: [{ type: Schema.Types.ObjectId, ref: "StudyMaterial" }],
    score: Number,
    percentage: Number,
    timeSpent: Number,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
)

AIPracticeExamSchema.index({ studentId: 1, createdAt: -1 })
AIPracticeExamSchema.index({ courseId: 1 })
AIPracticeExamSchema.index({ status: 1 })
AIPracticeExamSchema.index({ isActive: 1 })
AIPracticeExamSchema.index({ sessionId: 1 })

const AIPracticeExam =
  mongoose.models.AIPracticeExam ||
  mongoose.model<IAIPracticeExam>("AIPracticeExam", AIPracticeExamSchema)

export default AIPracticeExam
