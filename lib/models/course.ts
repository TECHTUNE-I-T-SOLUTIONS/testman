import { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
  },
  { timestamps: true }
);

const Course = models.Course || model("Course", CourseSchema);
export default Course;
