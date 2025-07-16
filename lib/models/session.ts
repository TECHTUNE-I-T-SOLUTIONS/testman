import mongoose, { Schema, Document } from "mongoose";

export interface IAcademicSession extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const AcademicSessionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.AcademicSession ||
  mongoose.model<IAcademicSession>("AcademicSession", AcademicSessionSchema);
