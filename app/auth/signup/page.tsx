"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import InstitutionalInfoForm from "@/components/student/signup/InstitutionalInfo"
import PasswordInfoForm from "@/components/student/signup/PasswordInfo"
import PersonalInfoForm from "@/components/student/signup/PersonalInfoForm"
import SignupPage from "@/components/student/signup/signup-page"
import useFormStore from "@/lib/store/useStudentFormStore"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Institution Info" },
  { id: 3, label: "Password" },
]

export default function RegisterForm() {
  const { step } = useFormStore()

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 relative">
      {/* Professional Back Button - Top Left */}
      <Link
        href="/"
        className={cn(
          "absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors group",
          "dark:text-white dark:hover:text-slate-100"
        )}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-700 dark:text-white" />
        <span className="text-sm font-medium dark:text-white">Back to Home</span>
      </Link>

      <SignupPage>
        {/* Professional Step Indicator */}
        <div className="flex justify-center mb-8 px-6">
          <div className="flex items-center space-x-4">
            {steps.map(({ id, label }, index) => (
              <div key={id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-300",
                      step === id
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : step > id
                          ? "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-200"
                          : "bg-white text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-400",
                    )}
                  >
                    {step > id ? (
                      <svg
                        className={cn(
                          "w-5 h-5",
                          step > id
                            ? "text-slate-600 dark:text-white"
                            : "text-slate-400 dark:text-slate-200"
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      id
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-2 transition-colors",
                      step === id
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-200",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-4 transition-colors",
                      step > id
                        ? "bg-slate-300 dark:bg-white"
                        : "bg-slate-200 dark:bg-slate-600"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border-0 backdrop-blur-sm">
          <form>
            {step === 1 && <PersonalInfoForm />}
            {step === 2 && <InstitutionalInfoForm />}
            {step === 3 && <PasswordInfoForm />}
          </form>
        </div>
      </SignupPage>
    </main>
  )
}
