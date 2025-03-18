"use client";
import InstitutionalInfoForm from "@/components/student/signup/InstitutionalInfo";
import PasswordInfoForm from "@/components/student/signup/PasswordInfo";
import PersonalInfoForm from "@/components/student/signup/PersonalInfoForm";
import SignupPage from "@/components/student/signup/signup-page";
import useFormStore from "@/lib/store/useStudentFormStore";

export default function RegisterForm() {
  const { step } = useFormStore();
  return (
    <SignupPage>
      {step === 1 && <PersonalInfoForm />}
      {step === 2 && <InstitutionalInfoForm />}
      {step === 3 && <PasswordInfoForm />}
    </SignupPage>
  );
}
