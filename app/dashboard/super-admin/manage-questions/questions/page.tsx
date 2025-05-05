"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown";
import OptionInput from "@/components/dashboard/manage-questions/questions/OptionInput";
import FileUpload from "@/components/dashboard/manage-questions/questions/FileUpload";
import QuestionsList from "@/components/dashboard/manage-questions/questions/QuestionList";
import Header from "@/components/dashboard/Header";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  courseId: string;
  questionText: string;
  options: Option[];
}

export default function QuestionsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      fetch(`/api/questions?courseId=${selectedCourse}`)
        .then((res) => res.json())
        .then((data: Question[]) => {
          setQuestions(data);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Error fetching questions");
          setLoading(false);
        });
    }
  }, [selectedCourse]);

  const addQuestion = async () => {
    if (!selectedCourse || !questionText.trim() || options.length < 2) {
      return toast.error(
        "Select a course, enter a question, and provide at least two options"
      );
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          questionText,
          options,
        }),
      });

      if (!response.ok) throw new Error("Failed to add question");

      const newQuestion: Question = await response.json();
      setQuestions([...questions, newQuestion]);
      toast.success("Question added successfully!");

      setQuestionText("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const response = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete question");

      setQuestions(questions.filter((q) => q._id !== id));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
      <Header title="Create Questions" />

      <CourseDropdown
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />

      {selectedCourse && (
        <>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question"
            className="w-full p-2 text-gray-900 mt-4 border rounded-md"
          ></textarea>

          <div className="mt-4">
            <OptionInput options={options} setOptions={setOptions} />
            <button
              onClick={addQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2 transition duration-300"
            >
              Add Question
            </button>
          </div>
        </>
      )}

      <div className="mt-6">
        <FileUpload selectedCourse={selectedCourse} />
      </div>

      {loading ? (
        <p className="mt-4 text-gray-500">Loading questions...</p>
      ) : (
        <QuestionsList questions={questions} deleteQuestion={deleteQuestion} />
      )}
    </div>
  );
}
