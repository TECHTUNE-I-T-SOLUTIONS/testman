import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

interface Question {
  _id: string;
  questionText: string;
  createdAt?: string;
}

interface ExamFormData {
  courseId: string;
  title: string;
  duration: number;
  selectedQuestions: string[];
  scheduledTime?: string;
}

interface Props {
  courseId: string;
  setValue: UseFormSetValue<ExamFormData>; 
  selectedQuestions: string[];
}

export default function QuestionSelection({
  courseId,
  setValue,
  selectedQuestions,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!courseId) return;

    const fetchQuestions = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/questions?courseId=${courseId}&sort=${sortOrder}`
        );
        if (!response.ok) throw new Error("Failed to fetch questions");

        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId, sortOrder]);

  const toggleSelection = (id: string) => {
    const updatedSelection = selectedQuestions.includes(id)
      ? selectedQuestions.filter((q) => q !== id)
      : [...selectedQuestions, id];

    setValue("selectedQuestions", updatedSelection);
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        ✏️ Select Questions
      </h3>

      {/* 🔍 Search and Sort Controls */}
      <div className="flex justify-between items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by question..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="p-2 border border-purple-400 text-purple-700 bg-white rounded-md"
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto border border-purple-400 rounded-lg p-3 bg-gray-50 shadow-sm">
        {loading ? (
          <p className="text-purple-500 text-sm">⏳ Loading questions...</p>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <label
              key={q._id}
              className="flex items-center gap-3 p-2 hover:bg-purple-100 rounded-md cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={selectedQuestions.includes(q._id)}
                onChange={() => toggleSelection(q._id)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-800">{q.questionText}</span>
            </label>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            🚫 No questions match your search.
          </p>
        )}
      </div>
    </div>
  );
}