"use client";
import { getStudentFromToken } from "@/utils/auth";
import { useState, useEffect } from "react";

type ExamResult = {
  _id: string;
  examTitle: string;
  course: string;
  score: number;
  totalQuestions: number;
};

export default function Results() {
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const student = await getStudentFromToken();
        const res = await fetch(`/api/results?studentId=${student?.id}`);
        if (!res.ok) throw new Error("Failed to fetch results");

        const data: { results: ExamResult[]; totalPages: number } =
          await res.json();

        setResults(data.results);
      } catch (error) {
        console.error("Error fetching results:", error);
        setResults([]); 
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="text-black">
      <h1 className="text-xl font-bold">Exam Results</h1>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <>
          <table className="w-full mt-4 border">
            <thead>
              <tr className="bg-gray-200">
              <th className="p-2 border">Title</th>
                <th className="p-2 border">Course</th>
                <th className="p-2 border">Score</th>
                <th className="p-2 border">Total Questions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result._id}>
                  <td className="p-2 border">{result.examTitle}</td>
                  <td className="p-2 border">{result.course}</td>
                  <td className="p-2 border">{result.score}</td>
                  <td className="p-2 border">{result.totalQuestions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
