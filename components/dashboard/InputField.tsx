"use client";

import React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error,
}: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`border rounded-lg px-3 text-gray-900 py-2 focus:outline-none focus:ring-2 transition ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "focus:ring-blue-500 border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
