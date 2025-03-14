import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  register: UseFormRegisterReturn;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  register,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        {...register}
        className={`mt-1 block w-full text-gray-900 p-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-md`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
