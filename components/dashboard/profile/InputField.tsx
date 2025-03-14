interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; 
  disabled?: boolean;
}

export default function InputField({
  label,
  type,
  value,
  onChange,
  disabled = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md text-gray-900 h-9 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

