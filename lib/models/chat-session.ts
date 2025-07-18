import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: {
    studyMode?: string
    fileReferences?: string[]
    questionCount?: number
    summaryType?: string
  }
}

export interface IChatSession extends Document {
  studentId: mongoose.Types.ObjectId
  sessionTitle: string
  studyMode: "questions" | "summary" | "explain" | "chat"
  materialIds: mongoose.Types.ObjectId[]
  messages: IMessage[]
  isActive: boolean
  lastActivity: Date
  totalMessages: number
  createdAt: Date
  updatedAt: Date
  extractedContent?: string
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    studyMode: { type: String },
    fileReferences: [{ type: String }],
    questionCount: { type: Number },
    summaryType: { type: String },
  },
})

const ChatSessionSchema = new Schema<IChatSession>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionTitle: { type: String, required: true },
    studyMode: {
      type: String,
      enum: ["questions", "summary", "explain", "chat"],
      required: true,
    },
    materialIds: [{ type: Schema.Types.ObjectId, ref: "StudyMaterial" }],
    messages: [MessageSchema],
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    totalMessages: { type: Number, default: 0 },
    extractedContent: { type: String },
  },
  { timestamps: true },
)

ChatSessionSchema.index({ studentId: 1, lastActivity: -1 })
ChatSessionSchema.index({ studyMode: 1 })
ChatSessionSchema.index({ isActive: 1 })

const ChatSession = mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema)

export default ChatSession
