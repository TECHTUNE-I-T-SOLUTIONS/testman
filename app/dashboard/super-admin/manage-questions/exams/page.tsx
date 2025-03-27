"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CourseDropdown from "@/components/dashboard/manage-questions/exams/CourseDropdown";
import QuestionSelection from "@/components/dashboard/manage-questions/exams/QuestionSelection";
import ScheduleExam from "@/components/dashboard/manage-questions/exams/ScheduleExam";
import ExamList from "@/components/dashboard/manage-questions/exams/ExamList";
import Header from "@/components/dashboard/Header";

interface ExamFormData {
  courseId: string;
  title: string;
  duration: number;
  selectedQuestions: string[];
  scheduledTime?: string;
}

export default function ExamForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExamFormData>({
    defaultValues: { selectedQuestions: [] },
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const courseId = watch("courseId");

  const onSubmit = async (data: ExamFormData) => {
    const selectedQuestions = watch("selectedQuestions") || [];

    const finalData = { ...data, selectedQuestions };

    console.log("Submitting Exam Data:", finalData);

    try {
      const response = await fetch("/api/exams/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error("Failed to create exam");

      toast.success(" Exam created successfully!");
      reset();
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <Header title="📘 Create Exam" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Course
          </label>
          <CourseDropdown register={register} />
          {errors.courseId && (
            <p className="text-red-500 text-sm mt-1">⚠️ Course is required.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Exam Title
          </label>
          <input
            {...register("title", { required: "Exam title is required" })}
            placeholder="Enter Exam Title"
            className="w-full p-3 border text-gray-900 border-purple-400 rounded focus:ring focus:ring-purple-300"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              ⚠️ {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-900 text-sm font-medium">
            Duration (Minutes)
          </label>
          <input
            {...register("duration", {
              required: "Duration is required",
              min: { value: 1, message: "Minimum duration is 1 minute" },
            })}
            type="number"
            placeholder="Enter duration"
            className="w-full p-3 border text-gray-900 border-purple-400 rounded focus:ring focus:ring-purple-300"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">
              ⚠️ {errors.duration.message}
            </p>
          )}
        </div>

        {courseId ? (
          <QuestionSelection
            courseId={courseId}
            setValue={setValue}
            selectedQuestions={watch("selectedQuestions")}
          />
        ) : (
          <p className="text-gray-500 text-sm italic">
            ℹ️ Select a course to load questions.
          </p>
        )}

        <ScheduleExam
          isScheduling={isScheduling}
          setIsScheduling={setIsScheduling}
          register={register}
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          {isScheduling ? "📅 Schedule Exam" : "🚀 Publish Exam"}
        </button>
      </form>

      {courseId ? (
        <ExamList selectedCourseId={courseId} />
      ) : (
        <p className="text-gray-500 text-sm italic mt-4">
          ℹ️ Select a course to view exams.
        </p>
      )}
    </div>
  );
}
