"use client";

import { useState, useEffect } from "react";
import DepartmentDropdown from "@/components/dashboard/manage-questions/results/DepartmentDropdown";
import ResultTable from "@/components/dashboard/manage-questions/results/ResultTable";
import Header from "@/components/dashboard/Header";

interface Result {
  _id: string;
  studentId: { _id: string; name: string };
  examId: { _id: string; title: string };
  score: number;
  totalMarks: number;
  grade: string;
  answers?: { questionId: { questionText: string }; isCorrect: boolean }[];
}

export default function ResultPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/results?department=${selectedDepartment}`
        );
        if (!res.ok) throw new Error("Failed to fetch results");
        const data: Result[] = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
  }, [selectedDepartment]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border border-purple-300">
      <Header title="🎓 Manage Student Results" />

      <div className="flex flex-col gap-6">
        <DepartmentDropdown onChange={setSelectedDepartment} />

        {selectedDepartment ? (
          results.length > 0 ? (
            <ResultTable results={results} />
          ) : (
            <p className="text-gray-500 text-center mt-4">
              🚫 No results available for this department.
            </p>
          )
        ) : (
          <p className="text-gray-500 text-center mt-4">
            ℹ️ Please select a department to view results.
          </p>
        )}
      </div>
    </div>
  );
}
