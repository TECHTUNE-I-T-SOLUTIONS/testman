import mongoose, { Schema, type Document } from "mongoose"

export interface IGeneratedContent extends Document {
  studentId: mongoose.Types.ObjectId
  sessionId: mongoose.Types.ObjectId
  materialIds: mongoose.Types.ObjectId[]
  contentType: "questions" | "summary" | "explanation" | "notes"
  title: string
  content: string
  metadata: {
    questionCount?: number
    difficulty?: "easy" | "medium" | "hard"
    topics?: string[]
    summaryType?: "brief" | "detailed" | "key-points"
    wordCount?: number
  }
  rating?: number
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

const GeneratedContentSchema = new Schema<IGeneratedContent>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true },
    materialIds: [{ type: Schema.Types.ObjectId, ref: "StudyMaterial" }],
    contentType: {
      type: String,
      enum: ["questions", "summary", "explanation", "notes"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    metadata: {
      questionCount: { type: Number },
      difficulty: { type: String, enum: ["easy", "medium", "hard"] },
      topics: [{ type: String }],
      summaryType: { type: String, enum: ["brief", "detailed", "key-points"] },
      wordCount: { type: Number },
    },
    rating: { type: Number, min: 1, max: 5 },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
)

GeneratedContentSchema.index({ studentId: 1, createdAt: -1 })
GeneratedContentSchema.index({ contentType: 1 })
GeneratedContentSchema.index({ isFavorite: 1 })

const GeneratedContent =
  mongoose.models.GeneratedContent || mongoose.model<IGeneratedContent>("GeneratedContent", GeneratedContentSchema)

export default GeneratedContent
