"use client";

import { useState, useEffect } from "react";
import { BookOpen, ChevronDown, ChevronUp, KeyRound, UserCircle2, Search } from "lucide-react";
import { getStudentFromToken, logoutStudent } from "@/utils/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Student {
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string };
  isActive: boolean;
  phoneNumber?: string; // ✅ added
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"Weak" | "Medium" | "Strong" | "Very Strong" | "">("");
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);


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

        setPhoneNumber(data.phoneNumber || ""); // This is the fix
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

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Password changed successfully. Logging out...");
        setNewPassword("");
        setIsLoggingOut(true);
        setTimeout(async () => {
          await logoutStudent();
          router.push("/auth/login");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error("Something went wrong");
    }
  };


  
  const handleUpdatePhoneNumber = async () => {
    try {
      const res = await fetch("/api/students/update-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber: student?.matricNumber,
          phoneNumber,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update phone number");
        return;
      }

      toast.success("Phone number updated!");
      setEditingPhone(false);
    } catch (err) {
      console.error("Error updating phone number:", err);
      toast.error("An error occurred");
    }
  };

  const handlePhoneBlur = () => {
    if (phoneNumber === student?.phoneNumber) {
      setEditingPhone(false);
    }
  };
  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPhoneNumber(student?.phoneNumber || "");
        setEditingPhone(false);
      }
    };

    if (editingPhone) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingPhone, student]);


  // Courses not in student's faculty (used for search)
  const otherCourses = allCourses.filter(
    (course) => course.facultyId !== student?.faculty._id
  );

  const filteredSearchResults = otherCourses.filter((course) =>
    `${course.code} ${course.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const evaluatePassword = (password: string) => {
    const feedback: string[] = [];

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUpperCase) feedback.push("Add at least one uppercase letter.");
    if (!hasLowerCase) feedback.push("Add at least one lowercase letter.");
    if (!hasNumber) feedback.push("Add at least one number.");
    if (!hasSpecialChar) feedback.push("Add at least one special character.");
    if (!isLongEnough) feedback.push("Password must be at least 8 characters long.");

    // Specify the union type directly
    let strength: "" | "Weak" | "Medium" | "Strong" | "Very Strong" = "";

    const passedChecks = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLongEnough].filter(Boolean).length;
    switch (passedChecks) {
      case 5:
        strength = "Very Strong";
        break;
      case 4:
        strength = "Strong";
        break;
      case 3:
        strength = "Medium";
        break;
      default:
        strength = "Weak";
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };


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
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                    <label className="font-semibold text-black">Phone Number: {student.phoneNumber}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        disabled={!editingPhone}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onBlur={handlePhoneBlur}

                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setPhoneNumber(student?.phoneNumber || "");
                            setEditingPhone(false);
                          }
                        }}
                        placeholder="Enter phone number"
                        className={`text-black transition-colors duration-200 ${
                          editingPhone ? "bg-white border border-black" : "bg-gray-200"
                        }`}
                        autoFocus={editingPhone}
                      />

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (editingPhone) {
                            handleUpdatePhoneNumber();
                          } else {
                            setEditingPhone(true);
                          }
                        }}
                        className="bg-white text-black font-bold"
                      >
                        {editingPhone ? "Save" : "Edit"}
                      </Button>
                    </div>
                  </div>
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
                  onChange={(e) => {
                    const pwd = e.target.value;
                    setNewPassword(pwd);
                    evaluatePassword(pwd);
                  }}
                  className="bg-gray-300 border-gray-700 text-black placeholder-gray-500"
                />
                <Button
                  onClick={() => setShowPasswordConfirmModal(true)}
                  className="mt-3 w-full bg-white text-black font-bold hover:bg-gray-300 transition"
                >
                  Update Password
                </Button>


                {newPassword && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">
                      Strength: <span className={
                        passwordStrength === "Very Strong" ? "text-green-700" :
                        passwordStrength === "Strong" ? "text-green-500" :
                        passwordStrength === "Medium" ? "text-yellow-600" :
                        "text-red-600"
                      }>
                        {passwordStrength}
                      </span>
                    </p>
                    {passwordFeedback.length > 0 && (
                      <ul className="text-sm text-red-600 list-disc list-inside mt-1 space-y-1">
                        {passwordFeedback.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>

              {showPasswordConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center space-y-4">
                    <h2 className="text-lg font-semibold text-red-600">Confirm Password Change</h2>
                    <p className="text-sm text-muted-foreground">
                      Changing your password will immediately log you out. You’ll have to log in again with the new password.
                    </p>

                    <div className="flex justify-center gap-4 pt-2">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowPasswordConfirmModal(false);
                          handleChangePassword();
                        }}
                      >
                        Yes, Change Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordConfirmModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isLoggingOut && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-white p-4 rounded shadow-lg text-center">
                    <p className="text-black font-semibold">Logging you out...</p>
                  </div>
                </div>
              )}

            </>
          ) : (
            <p className="text-center text-gray-900 animate-pulse">Loading profile...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
