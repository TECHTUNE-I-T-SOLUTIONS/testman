// lib/models/OTP.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  code: string;
  createdAt: Date;
  phoneNumber?: string;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: false, default: "" },
    code: { type: String, required: true },
    phoneNumber: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes
  },
  { timestamps: true }
);

const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;
