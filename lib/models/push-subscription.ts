
import mongoose, { Schema, Document } from 'mongoose'

export interface IPushSubscription extends Document {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userId: string
  userType: 'student' | 'admin'
  isActive: boolean
  createdAt: Date
  lastUsed: Date
}

const PushSubscriptionSchema = new Schema<IPushSubscription>({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  userId: { type: String, required: true },
  userType: { type: String, enum: ['student', 'admin'], required: true },
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: Date.now }
}, {
  timestamps: true
})

const PushSubscription = mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema)

export default PushSubscription
