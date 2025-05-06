"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Upload, FileSearch, View } from "lucide-react";
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown";
import Header from "@/components/dashboard/Header";

/* eslint-disable @typescript-eslint/no-unused-vars */
interface Course {
  _id: string;
  title: string;
  department: string;
  faculty: string;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

interface Note {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  courseId: string;
}

export default function ManageNotesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/notes?courseId=${selectedCourse}`)
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch(() => toast.error("Failed to fetch notes"));
    }
  }, [selectedCourse]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(uploadedFile.type)) {
      toast.error("Unsupported file type");
      return;
    }

    setFile(uploadedFile);
    setPreviewUrl(URL.createObjectURL(uploadedFile));
  };

  const uploadNote = async () => {
    if (!selectedCourse || !title || !file) {
      return toast.error("Select course, add title, and choose a file");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString();
      if (!base64) return toast.error("Failed to read file");

      const fileType = file.name.split(".").pop()?.toLowerCase();
      try {
        const res = await fetch("/api/notes/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: selectedCourse,
            title,
            fileUrl: base64,
            fileType,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast.success("Note uploaded");
        setNotes((prev) => [...prev, data.note]);
        setFile(null);
        setTitle("");
        setPreviewUrl("");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        toast.error(errorMessage);
      }
    };

    reader.readAsDataURL(file);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-5xl mx-auto w-full">
      <Header title="Manage Notes" />

      <CourseDropdown
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />

      {selectedCourse && (
        <>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-2 border rounded text-gray-900"
            />
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="mb-3 w-full"
            />

            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-64 border rounded mb-4"
              />
            )}

            <button
              onClick={uploadNote}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <Upload /> Upload Note
            </button>
          </div>
        </>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Search Notes</h3>
        <div className="flex items-center gap-2 mt-2">
          <FileSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, department, faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded text-gray-900"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div key={note._id} className="p-4 bg-gray-50 border rounded shadow">
              <p className="font-medium text-gray-800">📌 {note.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                File Type: {note.fileType.toUpperCase()}
              </p>
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:underline text-sm"
              >
                <View /> View Note
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
