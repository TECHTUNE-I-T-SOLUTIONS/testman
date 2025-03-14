import { UseFormRegister } from "react-hook-form";

interface ExamFormData {
  courseId: string;
  title: string;
  duration: number;
  selectedQuestions: string[];
  scheduleDate?: string; 
}

interface ScheduleExamProps {
  isScheduling: boolean;
  setIsScheduling: (value: boolean) => void;
  register: UseFormRegister<ExamFormData>; 
}

export default function ScheduleExam({
  isScheduling,
  setIsScheduling,
  register,
}: ScheduleExamProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isScheduling}
          onChange={() => setIsScheduling(!isScheduling)}
          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <span className="text-gray-800 font-medium">Schedule Exam</span>
      </label>

      {isScheduling && (
        <input
          type="datetime-local"
          {...register("scheduleDate")}
          className="p-2 border text-purple-600 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-200"
        />
      )}
    </div>
  );
}
