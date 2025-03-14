import mongoose, { Schema, Document, models } from "mongoose";

export interface IAdmin extends Document {
  matricNumber: string;
  email: string;
  password: string;
  role: "Admin" | "Sub-Admin";
  assignedFaculty?: mongoose.Types.ObjectId;
  assignedDepartment?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    matricNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Sub-Admin"], required: true },
    assignedFaculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
    assignedDepartment: { type: Schema.Types.ObjectId, ref: "Department" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Admin = models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
