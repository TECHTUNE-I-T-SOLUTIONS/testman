"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Exam {
  _id: string;
  title: string;
  duration: number;
  isActive: boolean;
  scheduledTime?: string;
}

export default function StudentExamList() {
  const params = useParams();
  const courseId = params.id;
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!courseId) return;

    console.log("Fetching exams for courseId:", courseId);

    const fetchExams = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/exams?courseId=${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch exams");

        const result = await response.json();

        setExams(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setError(" Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [courseId]);

  if (loading)
    return (
      <p className="text-center text-purple-600 font-semibold animate-pulse">
        ⏳ Loading exams...
      </p>
    );

  if (error)
    return <p className="text-center text-red-500 font-semibold">🚫 {error}</p>;

  if (exams.length === 0)
    return (
      <p className="text-center text-gray-500 font-medium">
        🚫 No exams available for this course.
      </p>
    );

  return (
    <div className="mt-8 max-w-3xl mx-auto p-6 bg-gradient-to-br from-purple-200 to-purple-500 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white text-center mb-5">
        📚 Available Exams
      </h2>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="flex justify-between items-center p-4 mb-3 bg-purple-50 rounded-lg border border-purple-300 shadow-sm transition duration-300 hover:shadow-md hover:bg-purple-100"
          >
            <div>
              <h3 className="text-lg font-semibold text-purple-900">
                {exam.title}
              </h3>
              <p className="text-sm text-gray-700">
                ⏳ Duration:{" "}
                <span className="font-medium">{exam.duration} min</span>
              </p>
              {exam.scheduledTime && (
                <p className="text-xs text-purple-600 mt-1">
                  📅 Scheduled for:{" "}
                  {new Date(exam.scheduledTime).toLocaleString()}
                </p>
              )}
            </div>

            <button
              onClick={() => router.push(`/student/exams/${exam._id}/take?courseId=${courseId}`)}
              className="px-5 py-2 bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:bg-purple-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Start Exam 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
