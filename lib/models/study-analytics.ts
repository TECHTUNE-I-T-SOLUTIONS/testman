import mongoose, { Schema, type Document } from "mongoose"

export interface IStudyAnalytics extends Document {
  studentId: mongoose.Types.ObjectId
  date: Date
  studyMode: "questions" | "summary" | "explain" | "chat"
  timeSpent: number // in minutes
  materialsUploaded: number
  questionsGenerated: number
  summariesCreated: number
  chatMessages: number
  topicsStudied: string[]
  weeklyGoal?: number
  monthlyGoal?: number
  createdAt: Date
  updatedAt: Date
}

const StudyAnalyticsSchema = new Schema<IStudyAnalytics>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: Date, required: true },
    studyMode: {
      type: String,
      enum: ["questions", "summary", "explain", "chat"],
      required: true,
    },
    timeSpent: { type: Number, default: 0 },
    materialsUploaded: { type: Number, default: 0 },
    questionsGenerated: { type: Number, default: 0 },
    summariesCreated: { type: Number, default: 0 },
    chatMessages: { type: Number, default: 0 },
    topicsStudied: [{ type: String }],
    weeklyGoal: { type: Number },
    monthlyGoal: { type: Number },
  },
  { timestamps: true },
)

StudyAnalyticsSchema.index({ studentId: 1, date: -1 })
StudyAnalyticsSchema.index({ studyMode: 1 })

const StudyAnalytics =
  mongoose.models.StudyAnalytics || mongoose.model<IStudyAnalytics>("StudyAnalytics", StudyAnalyticsSchema)

export default StudyAnalytics
