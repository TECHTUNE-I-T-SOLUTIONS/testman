"use client";

import { useState, useEffect } from "react";
import CourseForm from "@/components/dashboard/manage-academics/courses/CourseForm";
import CourseList from "@/components/dashboard/manage-academics/courses/CourseList";
import Header from "@/components/dashboard/Header";
import { Level } from "@/types/types";

type Course = {
  _id: string;
  name: string;
  code: string;
  facultyId: string;
  departmentId: { _id: string; name: string };
  levelId: { _id: string; name: string };
};

type Department = {
  _id: string;
  name: string;
  levels: Level[];
};

export default function CoursesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(
    undefined
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");

      const courses: Course[] = await response.json();

    
      const departmentMap = new Map<string, Department>();

      courses.forEach((course) => {
        const { departmentId, levelId } = course;

        if (!departmentMap.has(departmentId._id)) {
          departmentMap.set(departmentId._id, {
            _id: departmentId._id,
            name: departmentId.name,
            levels: [],
          });
        }

        const department = departmentMap.get(departmentId._id)!;
        let level = department.levels.find((lvl) => lvl._id === levelId._id);

        if (!level) {
          level = {
            _id: levelId._id,
            name: levelId.name,
            departmentId: departmentId._id,
            courses: [],
          };
          department.levels.push(level);
        }

        level.courses.push({
          _id: course._id,
          name: course.name,
          code: course.code,
        });
      });

      setDepartments(Array.from(departmentMap.values()));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setDepartments([]);
    }
  };

  const handleAddOrUpdate = async (
    courseData: Course | Omit<Course, "_id">
  ) => {
    try {
      const formattedData = {
        ...courseData,
        departmentId:
          typeof courseData.departmentId === "object"
            ? courseData.departmentId._id
            : courseData.departmentId,
        levelId:
          typeof courseData.levelId === "object"
            ? courseData.levelId._id
            : courseData.levelId,
      };

      const method = "_id" in courseData ? "PUT" : "POST";

      await fetch("/api/courses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      setEditingCourse(undefined);
      fetchCourses();
    } catch (err) {
      console.error("Error adding/updating course:", err);
    }
  };

  const handleEdit = (course: Course) => setEditingCourse(course);

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  return (
    <div>
      <Header title="Manage Courses" />
      <CourseForm onSubmit={handleAddOrUpdate} initialData={editingCourse} />
      <CourseList
        departments={departments}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
