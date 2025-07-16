import mongoose, { Schema, type Document } from "mongoose"

export interface IStudyMaterial extends Document {
  studentId: mongoose.Types.ObjectId
  courseId?: mongoose.Types.ObjectId
  title: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  extractedText?: string
  uploadDate: Date
  isProcessed: boolean
  processingStatus: "pending" | "processing" | "completed" | "failed"
  tags?: string[]
  subject?: string
  createdAt: Date
  updatedAt: Date
}

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String },
    uploadDate: { type: Date, default: Date.now },
    isProcessed: { type: Boolean, default: false },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    tags: [{ type: String }],
    subject: { type: String },
  },
  { timestamps: true },
)

StudyMaterialSchema.index({ studentId: 1, uploadDate: -1 })
StudyMaterialSchema.index({ courseId: 1 })
StudyMaterialSchema.index({ processingStatus: 1 })

const StudyMaterial =
  mongoose.models.StudyMaterial || mongoose.model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema)

export default StudyMaterial
