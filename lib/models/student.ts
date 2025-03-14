import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  matricNumber: string;
  faculty: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  level: mongoose.Types.ObjectId;
  password: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matricNumber: { type: String, required: true, unique: true },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    level: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
