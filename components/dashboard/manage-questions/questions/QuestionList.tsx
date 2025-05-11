import { useState } from "react";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  courseId: string;
  questionText: string;
  options: Option[];
  createdAt: string; // 👈 Add this
}


interface Props {
  questions: Question[];
  deleteQuestion: (id: string) => void;
}

export default function QuestionsList({ questions, deleteQuestion }: Props) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setSelectedQuestion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">📌 Questions</h3>

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center italic">No questions available.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((question, index) => (
            <li
              key={question._id}
              className="border border-gray-300 p-4 rounded-lg shadow-md bg-white"
            >
              <button
                onClick={() => toggleQuestion(question._id)}
                className="w-full text-left text-lg font-medium text-purple-600 hover:underline flex justify-between items-center"
              >
                <div>
                  <div>
                    Question {index + 1}: {question.questionText}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created on: {new Date(question.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="text-gray-500">
                  {selectedQuestion === question._id ? "▲" : "▼"}
                </span>
              </button>

              {selectedQuestion === question._id && (
                <div className="mt-3 bg-gray-100 p-3 rounded-md transition-all duration-200 ease-in-out">
                  <h4 className="font-semibold text-gray-800">Options:</h4>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    {question.options.map((option) => (
                      <li
                        key={`${question._id}-${option.text}`}
                        className={`text-gray-700 ${option.isCorrect ? "font-bold text-green-600" : ""}`}
                      >
                        {option.text} {option.isCorrect && "(Correct ✅)"}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => deleteQuestion(question._id)}
                    className="mt-3 px-4 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 transition duration-200"
                  >
                    🗑 Delete Question
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
