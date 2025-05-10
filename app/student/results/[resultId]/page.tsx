"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type ExamResultType = {
  course: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
  answers: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
};

type AnswerType = {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};


export default function ExamResult() {
  const { resultId } = useParams() as { resultId?: string };
  const router = useRouter();
  const [result, setResult] = useState<ExamResultType | null>(null);

  useEffect(() => {
    if (!resultId) return;

    fetch(`/api/results/${resultId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((data) => {
        const formattedData: ExamResultType = {
          course: data.course,
          examTitle: data.examTitle,
          score: data.score,
          totalQuestions: data.totalQuestions,
          createdAt: data.createdAt,
          answers: data.answers.map((a: AnswerType) => ({
            question: a.question,
            studentAnswer: a.studentAnswer,
            correctAnswer: a.correctAnswer,
            isCorrect: a.isCorrect,
          })),
        };
        setResult(formattedData);
      })
      .catch((err) => console.error(err));
  }, [resultId]);


  if (!result) return <p className="ml-6">Loading result...</p>;

  return (
    <div className="w-auto max-w-5xl border border-gray-800 bg-gray-100 shadow-lg transition-all duration-300 rounded-xl ml-4 mt-4 mr-4 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        ← Back to Results
      </button>

      <h1 className="text-xl text-center font-bold">Exam Result</h1>
      <p className="text-sm font-bold text-gray-600">Course: {result.course}</p>
      <p>Exam Title: {result.examTitle}</p>
      <p>Score: {result.score} / {result.totalQuestions}</p>
      <p>Date: {new Date(result.createdAt).toLocaleString()}</p>

      <h2 className="mt-4 text-lg font-semibold">Detailed Breakdown</h2>
      {result.answers.map((q, index) => (
        <div
          key={index}
          className={`p-2 my-2 border rounded ${
            q.isCorrect ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p>
            <strong>{index + 1}.</strong> {q.question}
          </p>
          <p>Your Answer: {q.studentAnswer}</p>
          <p>Correct Answer: {q.correctAnswer}</p>
        </div>
      ))}
    </div>
  );
}
