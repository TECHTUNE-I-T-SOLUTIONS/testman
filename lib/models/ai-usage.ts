import mongoose, { Schema, type Document } from "mongoose"

export interface IAIUsage extends Document {
  studentId: mongoose.Types.ObjectId
  plan: "free" | "premium"
  dailyTokensUsed: number
  lastResetDate: Date
  premiumExpiryDate?: Date
  totalTokensUsed: number
  createdAt: Date
  updatedAt: Date
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    dailyTokensUsed: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    premiumExpiryDate: { type: Date },
    totalTokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
)

AIUsageSchema.index({ studentId: 1 })
AIUsageSchema.index({ plan: 1 })
AIUsageSchema.index({ premiumExpiryDate: 1 })

const AIUsage = mongoose.models.AIUsage || mongoose.model<IAIUsage>("AIUsage", AIUsageSchema)

export default AIUsage
