"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Download } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import CourseDropdown from "@/components/dashboard/manage-questions/questions/CourseDropdown";

interface Note {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
  };
}

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes");
        const data = await res.json();
        setNotes(data);
        setFilteredNotes(data);
      } catch (error) {
        console.error("Failed to load notes:", error);
        toast.error("Failed to load notes.");
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.fileType.toLowerCase().includes(search.toLowerCase()) ||
        note.courseId.name.toLowerCase().includes(search.toLowerCase());

      const matchesCourse = selectedCourse ? note.courseId._id === selectedCourse : true;

      return matchesSearch && matchesCourse;
    });

    setFilteredNotes(filtered);
  }, [search, selectedCourse, notes]);

  const handleDownload = (fileUrl: string, title: string) => {
    try {
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = title;
      anchor.target = "_blank";
      anchor.click();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed.");
    }
  };

  return (
    <div className="p-6 bg-white rounded max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-bold text-center mb-4">📘 View & Download Notes</h2>

      {/* Search & Course Dropdown */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        <div className="flex items-center border rounded px-2">
          <Search className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No notes found.</p>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note._id}
              className={clsx("p-4 bg-gray-50 border rounded shadow hover:shadow-md flex flex-col justify-between")}
            >
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                  <FileText size={18} /> {note.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Type: <strong>{note.fileType?.toUpperCase()}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Course: <strong>{note.courseId.name} ({note.courseId.code})</strong>
                </p>
              </div>

              {/* File Preview */}
              <div className="mt-4">
                <iframe
                  src={note.fileUrl}
                  className="w-full h-48 border rounded"
                  title={note.title}
                />
              </div>

              {/* Download Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDownload(note.fileUrl, note.title)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  title="Download Note"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
