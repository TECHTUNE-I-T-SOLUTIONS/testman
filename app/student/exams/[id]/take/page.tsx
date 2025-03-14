"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Exam = {
  _id: string;
  title: string;
  duration: number;
  questions: {
    _id: string;
    id: string;
    questionText: string;
    options: Options[];
  }[];
};

type Options = {
  text: string;
};

export default function AttemptExam() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id;
  const courseId = searchParams.get("courseId");

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        if (!examId || !courseId) return;
        setLoading(true);

        const response = await fetch(
          `/api/exams?examId=${examId}&courseId=${courseId}`
        );
        if (!response.ok) throw new Error("Failed to fetch exam");

        const data = await response.json();
        setExam(data);
      } catch (error) {
        console.error("Error fetching exam:", error);
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, courseId]);

  const handleOptionChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit exam");

      toast.success("Exam submitted successfully!");
      router.push("/student/results");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error(" Error submitting exam. Try again.");
    }
  };

  if (loading)
    return (
      <p className="text-center text-purple-500 font-medium animate-pulse">
        ⏳ Loading exam...
      </p>
    );

  if (error)
    return <p className="text-center text-red-500 font-medium">🚫 {error}</p>;

  if (!exam)
    return (
      <p className="text-center text-gray-500 font-medium">
        🚫 Exam not found.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <Header title={`📝 ${exam.title}`} />

      <p className="text-gray-600">⏳ Duration: {exam.duration} minutes</p>

      <div className="mt-6">
        {exam.questions.map((question, index) => (
          <div key={question._id} className="mb-6">
            <h3 className="font-medium text-black">
              {index + 1}. {question.questionText}
            </h3>
            <div className="mt-2 space-y-2">
              {question.options.map((option, i) => (
                <label
                  key={i}
                  className="block text-black bg-gray-100 p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option.text}
                    className="mr-2"
                    checked={answers[question._id] === option.text}
                    onChange={() =>
                      handleOptionChange(question._id, option.text)
                    }
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-md transition"
      >
        Submit Exam
      </button>
    </div>
  );
}
