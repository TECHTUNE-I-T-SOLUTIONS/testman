// lib/models/otp.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
