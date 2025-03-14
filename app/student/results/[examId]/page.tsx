"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type ExamResultType = {
  course: string;
  score: number;
  totalQuestions: number;
  detailedResults: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
};

export default function ExamResult() {
  const { examId } = useParams() as { examId?: string }; 
  const [result, setResult] = useState<ExamResultType | null>(null);

  useEffect(() => {
    if (!examId) return; 

    fetch(`/api/results/${examId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((data: ExamResultType) => setResult(data))
      .catch((err) => console.error(err));
  }, [examId]); 

  if (!result) return <p>Loading result...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold">Exam Result</h1>
      <p>Course: {result.course}</p>
      <p>
        Score: {result.score} / {result.totalQuestions}
      </p>

      <h2 className="mt-4 text-lg font-bold">Detailed Breakdown</h2>
      {result.detailedResults.map((q, index) => (
        <div
          key={index}
          className={`p-2 border ${q.isCorrect ? "bg-green-200" : "bg-red-200"}`}
        >
          <p>
            {index + 1}. {q.question}
          </p>
          <p>Your Answer: {q.studentAnswer}</p>
          <p>Correct Answer: {q.correctAnswer}</p>
        </div>
      ))}
    </div>
  );
}
