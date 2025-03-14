interface Answer {
  questionId: { questionText: string };
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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h3 className="text-xl font-semibold text-purple-700 mb-2">
          📝 Exam: {result.examId.title}
        </h3>
        <p className="text-gray-700">🎓 Student: {result.studentId.name}</p>
        <p className="text-gray-700">
          🏆 Score: <b>{result.score}</b> / {result.totalMarks}
        </p>

        <h4 className="mt-4 font-medium text-purple-600">📌 Answers</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {result.answers?.map((answer, index) => (
            <li key={index}>
              <span className="font-medium">
                {answer.questionId.questionText}
              </span>{" "}
              -{" "}
              <b
                className={answer.isCorrect ? "text-green-600" : "text-red-600"}
              >
                {answer.isCorrect ? "Correct" : " Wrong"}
              </b>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
