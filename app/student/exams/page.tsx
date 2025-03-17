"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Course = {
  _id: string;
  name: string;
};

export default function Exams() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(" Error fetching courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStartExam = () => {
    if (!selectedCourse) {
      toast.warn(" Please select a course first.");
      return;
    }
    router.push(`/student/exams/${selectedCourse}`);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <Header title="Take an Exam" />

      <div className="mt-4">
        <label
          htmlFor="courseSelect"
          className="block text-gray-700 font-medium"
        >
          Select Course
        </label>
        <select
          id="courseSelect"
          className="w-full mt-2 p-3 border rounded-md focus:ring focus:ring-purple-300 text-gray-900"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={loading}
          aria-live="polite"
        >
          <option value="">
            {loading ? "Loading courses..." : "-- Select a Course --"}
          </option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleStartExam}
        disabled={!selectedCourse}
        className={`w-full mt-5 py-3 rounded-md text-white font-semibold transition ${
          selectedCourse
            ? "bg-purple-700 hover:bg-purple-800"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {selectedCourse ? "Start Exam" : "Select a Course to Start"}
      </button>
    </div>
  );
}
