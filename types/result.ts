// types/result.ts
export interface Answer {
  questionId: { questionText: string };
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  question?: string;
  options?: string[];
}

export interface Result {
  _id: string
  studentId: { _id: string; name: string }
  examId: { _id: string; title: string }
  score: number
  totalMarks: number
  grade: string
  answers?: Answer[]
}
