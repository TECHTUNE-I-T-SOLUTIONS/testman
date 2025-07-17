
import mongoose, { Schema, Document } from 'mongoose'

export interface IPushNotification extends Document {
  title: string
  message: string
  url?: string
  icon?: string
  badge?: string
  targetAudience: 'all' | 'students' | 'admins'
  isScheduled: boolean
  scheduledAt?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  clickCount: number
  deliveryCount: number
}

const PushNotificationSchema = new Schema<IPushNotification>({
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  url: { type: String, default: null },
  icon: { type: String, default: '/favicon.ico' },
  badge: { type: String, default: '/favicon.ico' },
  targetAudience: { 
    type: String, 
    enum: ['all', 'students', 'admins'], 
    default: 'all' 
  },
  isScheduled: { type: Boolean, default: false },
  scheduledAt: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sent', 'failed'], 
    default: 'draft' 
  },
  createdBy: { type: String, required: true },
  clickCount: { type: Number, default: 0 },
  deliveryCount: { type: Number, default: 0 }
}, {
  timestamps: true
})

const PushNotification = mongoose.models.PushNotification || mongoose.model<IPushNotification>('PushNotification', PushNotificationSchema)

export default PushNotification
