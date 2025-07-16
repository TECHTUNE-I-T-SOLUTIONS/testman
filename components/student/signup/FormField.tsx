import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  register: UseFormRegisterReturn; 
  required?: boolean;
  error?: string;
}

export default function FormField({
  label,
  type = "text",
  placeholder,
  register,
  required = false,
}: FormFieldProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-purple-700 font-medium">{label}</label>
      <input
        type={type}
        {...register} 
        placeholder={placeholder}
        className="border border-gray-300 p-2 text-gray-900 rounded-md focus:ring-2 focus:ring-purple-500"
        required={required}
      />
    </div>
  );
}
