"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!file) return toast.error("Please select an Excel file");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const response = await fetch("/api/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonData }), 
      });

      if (!response.ok) return toast.error("Failed to upload questions");
      toast.success("Questions uploaded successfully!");
      setFile(null); 
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-lg w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Questions (Excel)
      </label>
      <div className="relative w-full">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-100">
          <span className="text-sm text-gray-600">
            {file ? file.name : "Choose a file..."}
          </span>
          <button className="text-purple-600 font-medium hover:underline">
            Browse
          </button>
        </div>
      </div>
      <button
        onClick={handleFileUpload}
        className="mt-4 w-full rounded-md bg-purple-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-purple-700 transition duration-200"
        disabled={!file}
      >
        Upload Excel
      </button>
    </div>
  );
}
