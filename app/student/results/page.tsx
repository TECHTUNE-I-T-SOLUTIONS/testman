"use client";
import { getStudentFromToken } from "@/utils/auth";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import debounce from "lodash.debounce";

type ExamResult = {
  _id: string;
  examTitle: string;
  course: string;
  score: number;
  totalQuestions: number;
};

export default function Results() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

const debouncedHandleSearch = useMemo(
  () =>
    debounce((query: string) => {
      setDebouncedSearch(query);
      setPage(1);
    }, 300),
  []
);

useEffect(() => {
  debouncedHandleSearch(searchQuery);
}, [searchQuery, debouncedHandleSearch]);


  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const student = await getStudentFromToken();
        const res = await fetch(
          `/api/results?studentId=${student?.id}&page=${page}&search=${debouncedSearch}`
        );

        if (!res.ok) throw new Error("Failed to fetch results");

        const data: { results: ExamResult[]; totalPages: number } =
          await res.json();

        setResults(data.results);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching results:", error);
        setError("Failed to load results. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [page, debouncedSearch]);

  return (
    <>
      <div className="text-purple-700 px-6 text-xl font-medium">
        <Link href="/student">⇽Home</Link>
      </div>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-purple-700 text-center mb-6">
          📊 Exam Results
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search by Exam Title or Course..."
            className="w-full text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-purple-500 font-medium animate-pulse">
            ⏳ Fetching your results...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 flex flex-col items-center">
            <span className="text-5xl">📄</span>
            <p className="mt-2">No exam results found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => {
              const percentage = (result.score / result.totalQuestions) * 100;
              const formattedPercentage = parseFloat(percentage.toFixed(1));

              const status =
                formattedPercentage >= 70
                  ? "bg-green-600"
                  : formattedPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-600";

              return (
                <div
                  key={result._id}
                  className="p-5 border rounded-lg shadow-sm bg-gray-50"
                >
                  <h2 className="text-lg font-semibold text-gray-800">
                    📝 {result.examTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
                    📚 Course:{" "}
                    <span className="font-medium">{result.course}</span>
                  </p>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">
                      Score: <span className="font-bold">{result.score}</span> /{" "}
                      {result.totalQuestions}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className={`h-3 ${status} rounded-full`}
                        style={{ width: `${formattedPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs font-medium mt-1 text-gray-600">
                      {formattedPercentage}% -{" "}
                      {formattedPercentage >= 70
                        ? "Excellent 🎉"
                        : formattedPercentage >= 50
                          ? "Average 👍"
                          : "Needs Improvement 📉"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              className={`px-4 py-2 text-white font-medium rounded-lg transition ${
                page === 1 || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
            >
              {loading ? "⏳ Loading..." : "◀ Previous"}
            </button>

            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              className={`px-4 py-2 text-white font-medium rounded-lg transition ${
                page === totalPages || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
            >
              {loading ? "⏳ Loading..." : "Next ▶"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
