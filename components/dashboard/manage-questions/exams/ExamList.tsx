"use client";

import { useEffect, useState } from "react";
import ToggleExamStatus from "./ToggleExamStatus";

interface Exam {
  _id: string;
  title: string;
  duration: number;
  isActive: boolean;
  courseId: { _id: string; name: string };
  scheduledTime?: string;
}

interface ExamListProps {
  selectedCourseId: string; 
}

export default function ExamList({ selectedCourseId }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📡 Fetching exams for courseId:", selectedCourseId);
        const response = await fetch(
          `/api/exams/admin?courseId=${selectedCourseId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch exams");

        const result = await response.json();
        console.log("API Response:", result);

        if (Array.isArray(result?.data)) {
          setExams(result.data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error(" Error fetching exams:", error);
        setError("Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [selectedCourseId]);

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
        📚 Exams for Selected Course
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

            <ToggleExamStatus exam={exam} />
          </div>
        ))}
      </div>
    </div>
  );
}
