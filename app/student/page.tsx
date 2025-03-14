"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentFromToken } from "@/utils/auth";

export default function Dashboard() {
  const [student, setStudent] = useState<{
    name: string;
    matricNumber: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudent = async () => {
      const studentData = await getStudentFromToken(); 
      if (!studentData) {
        router.push("/login");
      } else {
        setStudent(studentData);
      }
    };

    fetchStudent();
  }, [router]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-700 text-lg">
        Loading...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-300 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 border border-purple-400">
        <h1 className="text-3xl font-bold text-purple-700 text-center">
          🎓 Welcome, {student.name}!
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Matric Number:{" "}
          <span className="font-semibold">{student.matricNumber}</span>
        </p>

      
      </div>
    </div>
  );
}
