"use client";

import { useEffect, useState } from "react";
import { UseFormRegister } from "react-hook-form";

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface ExamFormData {
  courseId: string;
  title: string;
  duration: number;
  selectedQuestions: string[];
  scheduledTime?: string;
}

interface CourseDropdownProps {
  register: UseFormRegister<ExamFormData>; 
}

export default function CourseDropdown({ register }: CourseDropdownProps) {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Failed to load courses");
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <select
      {...register("courseId", { required: true })}
      className="w-full text-gray-900 p-2 border rounded"
    >
      <option value="">Select Course</option>
      {courses.map((course) => (
        <option key={course._id} value={course._id}>
          {course.code} ({course.name})
        </option>
      ))}
    </select>
  );
}
