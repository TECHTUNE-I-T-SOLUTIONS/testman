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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

        const data: Exam = await response.json();
        setExam(data);

        const storedStartTime = localStorage.getItem(`exam_start_${examId}`);
        const now = Date.now();

        if (storedStartTime) {
          const elapsedTime = Math.floor(
            (now - parseInt(storedStartTime)) / 1000
          );
          const remainingTime = data.duration * 60 - elapsedTime;
          setTimeLeft(remainingTime > 0 ? remainingTime : 0);
        } else {
          localStorage.setItem(`exam_start_${examId}`, now.toString());
          setTimeLeft(data.duration * 60);
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, courseId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      toast.warn("⏳ Time is up! Submitting your exam...");

      (async () => {
        if (!exam || submitting) return;

        try {
          setSubmitting(true);
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
          toast.error("Error submitting exam. Try again.");
        } finally {
          setSubmitting(false);
        }
      })();
    }
  }, [timeLeft, exam, submitting, answers, router, examId]);

  const handleOptionChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    if (!exam || submitting) return;

    try {
      setSubmitting(true);
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
      toast.error("Error submitting exam. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Move these conditions into the main return statement
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

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <Header title={`📝 ${exam.title}`} />

      <p className="text-lg font-semibold text-purple-700 bg-purple-100 px-4 py-2 rounded-lg inline-block shadow-md">
        ⏳ Time Left: <span className="font-bold">{formatTime(timeLeft)}</span>
      </p>

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
        disabled={submitting}
        className={`w-full mt-5 py-3 text-white font-semibold rounded-md transition ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-700 hover:bg-purple-800"
        }`}
      >
        {submitting ? "Submitting..." : "Submit Exam"}
      </button>
    </div>
  );
}
