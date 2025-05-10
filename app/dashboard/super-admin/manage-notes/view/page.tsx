"use client"; // Add this line to make this component a client component

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash, Edit, Search, FileText } from "lucide-react";
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

export default function ViewNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");


  const [modalOpen, setModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileType, setNewFileType] = useState("");


  useEffect(() => {
    const fetchAll = async () => {
      try {
        const noteRes = await fetch("/api/notes");
        const noteData = await noteRes.json();
        setNotes(noteData);
        setFilteredNotes(noteData);
      } catch {
        toast.error("Failed to load notes or courses");
      }
    };

    fetchAll();
  }, []);

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete note");

      const updated = notes.filter((note) => note._id !== id);
      setNotes(updated);
      setFilteredNotes(updated);
      toast.success("Note deleted");
    } catch {
      toast.error("Could not delete note");
    }
  };


  const handleEdit = (noteId: string) => {
    const noteToEdit = notes.find((note) => note._id === noteId);
    if (noteToEdit) {
      setCurrentNote(noteToEdit);
      setNewTitle(noteToEdit.title);
      setNewFileUrl(noteToEdit.fileUrl);
      setNewFileType(noteToEdit.fileType);
      setModalOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setNewFileUrl(URL.createObjectURL(file));
      setNewFileType(file.type);
    }
  };

	const handleSave = async () => {
	  if (!currentNote) return;

	  const formData = new FormData();
	  formData.append("id", currentNote._id);
	  formData.append("title", newTitle);
	  formData.append("fileUrl", newFileUrl);
	  formData.append("fileType", newFileType);

	  if (newFile) {
	    formData.append("file", newFile); // Append the actual file
	  }

	  const res = await fetch("/api/notes", {
	    method: "PUT",
	    body: formData,
	  });

	  if (res.ok) {
	    toast.success("Note updated successfully");
	    setModalOpen(false);
	    // Optionally, update the note state after saving
	    const updatedNotes = notes.map((note) =>
	      note._id === currentNote._id ? { ...note, title: newTitle, fileUrl: newFileUrl, fileType: newFileType } : note
	    );
	    setNotes(updatedNotes);
	  } else {
	    toast.error("Failed to update the note");
	  }
	};


  return (
    <div className="p-6 bg-white shadow rounded max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-bold text-center mb-4">📚 All Notes</h2>

      {/* Search & Course Dropdown */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <CourseDropdown selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        <div className="flex items-center border h-12 rounded mt-4 px-2">
          <Search className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by title, code, type..."
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
              className={clsx("p-4 bg-gray-50 border rounded shadow transition-all hover:shadow-md flex flex-col justify-between")}
            >
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                  <FileText size={18} /> {note.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Type: <strong>{note.fileType?.toUpperCase()}</strong></p>
                <p className="text-sm text-gray-600">
                  Course: <strong>{note.courseId.name} ({note.courseId.code})</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => handleEdit(note._id)} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                  <Edit size={18} />
                </button>
                <button onClick={() => deleteNote(note._id)} className="text-red-600 hover:text-red-800 transition" title="Delete">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for editing note */}
      {modalOpen && currentNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 md:w-1/2">
            <h3 className="text-xl font-bold mb-4">Edit Note</h3>
            <div>
              <label className="block text-sm font-semibold">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-2"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold">File Preview</label>
              {newFileUrl && (
                <div className="mt-2">
                  <iframe src={newFileUrl} className="w-full h-60" />
                </div>
              )}
              {!newFileUrl && currentNote.fileUrl && (
                <div className="mt-2">
                  <iframe src={currentNote.fileUrl} className="w-full h-60" />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold">Replace File</label>
              <input type="file" onChange={handleFileChange} className="mt-2" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
