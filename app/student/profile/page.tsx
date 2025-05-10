"use client";

import { useState, useEffect } from "react";
import { BookOpen, ChevronDown, ChevronUp, KeyRound, UserCircle2, Search } from "lucide-react";
import { getStudentFromToken } from "@/utils/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Student {
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string };
  isActive: boolean;
}


interface Course {
  _id: string;
  name: string;
  code: string;
  facultyId: string;
  departmentId: string;
  levelId: string;
}

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [relevantCourses, setRelevantCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRelevant, setShowRelevant] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Get student from token and fetch their data
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const tokenStudent = await getStudentFromToken();
        if (!tokenStudent?.matricNumber) return;

        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber);
        const res = await fetch(`/api/students/${encodedMatric}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");

      setStudent({
        ...data,
        isActive: data.isActive === "True" || data.isActive === true,
      });
      } catch (err) {
        console.error("Failed to fetch student", err);
      }
    };

    fetchStudentDetails();
  }, []);

  // Fetch all courses and derive relevant + searchable ones
  useEffect(() => {
    const fetchCourses = async () => {
      if (!student?.faculty) return;

      try {
        const res = await fetch("/api/courses");
        const courses: Course[] = await res.json();
        setAllCourses(courses);

        // Filter relevant courses based on facultyId
        const relevant = courses.filter(
          (course) => course.facultyId === student.faculty._id
        );
        setRelevantCourses(relevant);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };

    if (student) fetchCourses();
  }, [student]);

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setNewPassword("");
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      console.error("Something went wrong:", error);      
      toast.error("Something went wrong");
    }
  };

  // Courses not in student's faculty (used for search)
  const otherCourses = allCourses.filter(
    (course) => course.facultyId !== student?.faculty._id
  );

  const filteredSearchResults = otherCourses.filter((course) =>
    `${course.code} ${course.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-white px-4 py-10 flex justify-center items-start">
      <Card className="w-full max-w-5xl border border-gray-800 bg-gray-200 shadow-lg transition-all duration-300 rounded-xl">
        <CardHeader className="border-b border-gray-700 pb-5">
          <div className="flex items-center justify-center gap-3">
            <UserCircle2 className="text-black" size={28} />
            <CardTitle className="text-2xl font-bold text-black">Student Profile</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 py-6">
          {student ? (
            <>
              {/* Profile Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-900">
                  <p><span className="font-semibold text-black">Name:</span> {student.name}</p>
                  <p><span className="font-semibold text-black">Matric Number:</span> {student.matricNumber}</p>
                  <p><span className="font-semibold text-black">Email:</span> {student.email}</p>
                  <p><span className="font-semibold text-black">Faculty:</span> {student.faculty.name}</p>
                  <p><span className="font-semibold text-black">Department:</span> {student.department.name}</p>
                  <p><span className="font-semibold text-black">Level:</span> {student.level.name}</p>
                  <p>
                    <span className="font-semibold text-black">Active:</span>{" "}
                    {student.isActive ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Relevant Courses Section */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setShowRelevant(!showRelevant)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-gray-900 group-hover:text-gray-900 transition" size={20} />
                    <h2 className="text-lg font-semibold text-black">Relevant Courses</h2>
                  </div>
                  {showRelevant ? (
                    <ChevronUp className="text-gray-400" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </div>

                {showRelevant && (
                  <ul className="grid gap-2 mt-4 animate-fade-in">
                    {relevantCourses.map((course) => (
                      <li
                        key={course._id}
                        className="p-3 bg-gray-800 text-white rounded-md border border-gray-700"
                      >
                        {course.code} - {course.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Search Other Courses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="text-gray-900" size={20} />
                  <h2 className="text-lg font-semibold text-black">Search Other Courses</h2>
                </div>
                <Input
                  type="text"
                  placeholder="Search by course name or code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black border-gray-700 text-white placeholder-gray-500"
                />
                {searchTerm && (
                  <div className="mt-3 space-y-2">
                    {filteredSearchResults.length === 0 ? (
                      <p className="text-sm italic font-bold text-center text-gray-900">Course not found! Perhaps your course hasn&apos;t been added yet.</p>
                    ) : (
                      filteredSearchResults.map((course) => (
                        <li
                          key={course._id}
                          className="p-3 bg-gray-900 text-white border border-gray-700 rounded-md list-none"
                        >
                          {course.code} - {course.name}
                        </li>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="text-gray-black" size={20} />
                  <h2 className="text-lg font-semibold text-black">Change Password</h2>
                </div>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black border-gray-700 text-black placeholder-gray-500"
                />
                <Button
                  onClick={handleChangePassword}
                  className="mt-3 w-full bg-white text-black font-bold hover:bg-gray-300 transition"
                >
                  Update Password
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-900 animate-pulse">Loading profile...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
