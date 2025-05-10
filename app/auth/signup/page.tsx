"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import InstitutionalInfoForm from "@/components/student/signup/InstitutionalInfo";
import PasswordInfoForm from "@/components/student/signup/PasswordInfo";
import PersonalInfoForm from "@/components/student/signup/PersonalInfoForm";
import SignupPage from "@/components/student/signup/signup-page";
import useFormStore from "@/lib/store/useStudentFormStore";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Institution Info" },
  { id: 3, label: "Password" },
];

export default function RegisterForm() {
  const { step } = useFormStore();

  return (
    <SignupPage>
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/"
          className="flex items-center center p-2 justify-center mb-4 bg-gray-700 w-auto rounded-xl text-blue-100 hover:text-purple-900 hover:bg-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-6 space-x-4">
        {steps.map(({ id, label }) => (
          <div
            key={id}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-300",
              step === id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-md scale-110"
                : "bg-white text-gray-600 border-gray-300"
            )}
            title={label}
          >
            {id}
          </div>
        ))}
      </div>

      {/* Animated Border Wrapper */}
      <div className="relative p-1 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse-shadow">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form>
            {step === 1 && <PersonalInfoForm />}
            {step === 2 && <InstitutionalInfoForm />}
            {step === 3 && <PasswordInfoForm />}
          </form>
        </div>
      </div>
    </SignupPage>
  );
}
