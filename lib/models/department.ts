import mongoose, { Schema, Document, models } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  facultyId: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
  },
  { timestamps: true }
);

export default models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);
