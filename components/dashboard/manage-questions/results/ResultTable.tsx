import { useState } from "react";
import ResultDetailsModal from "./ResultDetailsModal";
import { Result } from "@/types/result"

// interface Option {
//   text: string;
//   isCorrect: boolean;
// }

// interface Answer {
//   questionId: string; // or `{ _id: string }` if you're populating
//   question: string;
//   options: Option[];
//   correctAnswer: string;
//   studentAnswer: string;
//   isCorrect: boolean;
// }

// interface Result {
//   _id: string;
//   studentId: { _id: string; name: string };
//   examId: { _id: string; title: string };
//   score: number;
//   totalMarks: number;
//   answers?: Answer[];
// }

export default function ResultTable({ results }: { results: Result[] }) {
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  return (
    <div className="mt-6">
      {results.length > 0 ? (
        <div className="overflow-x-auto border border-purple-400 rounded-lg shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-purple-100 text-purple-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="border border-purple-300 p-3 text-left">
                  👨‍🎓 Student
                </th>
                <th className="border border-purple-300 p-3 text-left">
                  📚 Exam
                </th>
                <th className="border border-purple-300 p-3 text-left">
                  🎯 Score
                </th>
                <th className="border border-purple-300 p-3 text-center">
                  🔍 Action
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr
                  key={result._id}
                  className={`border border-purple-300 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-purple-50 transition`}
                >
                  <td className="p-3 text-gray-800">{result.studentId.name}</td>
                  <td className="p-3 text-gray-800">{result.examId.title}</td>
                  <td className="p-3 text-gray-800 font-medium">
                    {result.score} / {result.totalMarks}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-gray-600 text-center text-lg">
          🚫 No results found.
        </p>
      )}

      {/* Modal for viewing details */}
      {selectedResult && (
        <ResultDetailsModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}
