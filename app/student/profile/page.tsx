"use client";
import { useState, useEffect } from "react";

interface Course {
  id: number | string;
  name: string;
}

interface RawCourse {
  _id: string;
  name: string;
}

export default function Profile() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data: RawCourse[]) => {
        if (Array.isArray(data)) {
          const cleanedCourses = data.map((course) => ({
            id: course._id,
            name: course.name,
          }));
          setCourses(cleanedCourses);
        }
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);



  const handleChangePassword = async () => {
    if (!newPassword) return alert("Enter new password");

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    if (response.ok) {
      alert("Password changed successfully");
      setNewPassword(""); 
    } else {
      alert("Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-purple-700 text-center">
          Profile
        </h1>

        <h2 className="mt-6 text-lg font-semibold text-purple-600">
          Available Courses
        </h2>
        <ul className="mt-2 space-y-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="p-3 bg-purple-100 border text-purple-500 border-purple-300 rounded-lg shadow-sm transition-all hover:bg-purple-200 hover:scale-105"
            >
              {course.name}
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg font-semibold text-purple-600">
          Change Password
        </h2>
        <input
          type="password"
          className="w-full p-3 mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handleChangePassword}
          className="w-full mt-4 p-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
