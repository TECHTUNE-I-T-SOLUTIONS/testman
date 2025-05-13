import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface Answer {
  questionId: { questionText: string };
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface Result {
  _id: string;
  studentId: { _id: string; name: string };
  examId: { _id: string; title: string };
  score: number;
  grade: string;
  totalMarks: number;
  answers?: Answer[];
}

interface Props {
  result: Result;
  onClose: () => void;
}

export default function ResultDetailsModal({ result, onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const answers = result.answers || [];
  const currentAnswer = answers[currentPage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white max-h-[90vh] overflow-y-auto w-full max-w-xl p-6 rounded-lg shadow-xl animate-fadeIn transition-transform duration-300 transform scale-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Info */}
        <h3 className="text-xl font-semibold text-purple-700 mb-1">
          📝 Exam: {result.examId.title}
        </h3>
        <p className="text-gray-700">🎓 Student: {result.studentId.name}</p>
        <p className="text-gray-700 mb-4">
          🏆 Score: <b>{result.score}</b> / {result.totalMarks}
        </p>

        {/* Question Display */}
        {currentAnswer && (
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-purple-600">
              Question {currentPage + 1} of {answers.length}
            </h4>
            <p className="text-gray-800 font-semibold">
              {currentAnswer.questionId.questionText}
            </p>
            <p>
              Student’s Answer:{" "}
              <span
                className={
                  currentAnswer.isCorrect
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {currentAnswer.studentAnswer}
              </span>{" "}
              {currentAnswer.isCorrect ? "✔️" : "❌"}
            </p>
            <p>
              Correct Answer:{" "}
              <span className="text-blue-600 font-semibold">
                {currentAnswer.correctAnswer}
              </span>
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === answers.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded disabled:opacity-50 transition"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
