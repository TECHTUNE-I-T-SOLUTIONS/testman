"use client";

import * as XLSX from "xlsx";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  selectedCourse: string;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

interface ExcelRow {
  Question: string;
  "Option A": string;
  "Option B": string;
  "Option C": string;
  "Option D": string;
  Answer: "A" | "B" | "C" | "D";
}

interface ParsedQuestion {
  questionText: string;
  options: Option[];
}

export default function FileUpload({ selectedCourse }: Props) {
  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      const formatted = jsonData.map((item) => ({
        questionText: item["Question"] || "",
        options: [
          { text: item["Option A"] || "", isCorrect: item["Answer"] === "A" },
          { text: item["Option B"] || "", isCorrect: item["Answer"] === "B" },
          { text: item["Option C"] || "", isCorrect: item["Answer"] === "C" },
          { text: item["Option D"] || "", isCorrect: item["Answer"] === "D" },
        ].filter(opt => opt.text),
      }));


      setPreviewQuestions(formatted);
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadToBackend = async () => {
    if (!selectedCourse) return toast.error("Please select a course");

    const questionsPayload = previewQuestions.map((q) => ({
      courseId: selectedCourse,
      questionText: q.questionText,
      options: q.options,
    }));

    try {
      const res = await fetch("/api/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      toast.success("Bulk upload successful!");
      setPreviewQuestions([]);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to upload");
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-md shadow-lg w-full max-w-md mx-auto">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload Excel File:
      </label>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="mb-4"
      />

      {previewQuestions.length > 0 && (
        <div className="mb-4 border p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Preview:</h4>
          <ul className="list-disc pl-5 text-sm max-h-64 overflow-y-auto">
            {previewQuestions.map((q, idx) => (
              <li key={idx}>
                <p><strong>Q:</strong> {q.questionText}</p>
                <ul className="list-circle pl-4">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt.isCorrect ? "text-green-600" : ""}>
                      {opt.text} {opt.isCorrect && "(Correct)"}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {previewQuestions.length > 0 && (
        <button
          onClick={uploadToBackend}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300"
        >
          Upload Excel Questions
        </button>
      )}
    </div>
  );
}
