import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
      {...props}
    >
      {children}
    </button>
  );
}
