"use client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFormStore from "@/lib/store/useStudentFormStore";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PasswordInfoForm = () => {
  const { formData, resetForm, setStep } = useFormStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirm_password: "",
  });
  const router = useRouter();

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter.";
    if (!/[0-9]/.test(password)) return "Must contain a number.";
    if (!/[!@#$%^&*]/.test(password)) return "Must contain a special character.";
    return "";
  };

  const handlePasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(password.password),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword((prev) => ({ ...prev, password: e.target.value.trim() }));
  };

  const handleConfirmPasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      confirm_password:
        password.confirm_password !== password.password ? "Passwords do not match." : "",
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword((prev) => ({ ...prev, confirm_password: e.target.value.trim() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password.password);
    const confirmPasswordError =
      password.confirm_password !== password.password ? "Passwords do not match." : "";
  
    if (passwordError || confirmPasswordError) {
      setErrors({ password: passwordError, confirm_password: confirmPasswordError });
      return;
    }
  
    // Create a local copy of the updated formData
    const updatedFormData = {
      ...formData,
      password: password.password,
      confirmPassword: password.confirm_password,
    };
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData), // Use the updated formData
      });
      if (response.ok) {
        toast.success("Registration Successful!");
        router.push("/login");
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.message || "Registration failed. Try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };
  return (
    <>
      <CardHeader>
        <CardTitle>Password Information</CardTitle>
        <CardDescription>Create a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" >
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password.password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder="********"
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm" aria-live="polite">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              value={password.confirm_password}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              placeholder="********"
              required
              autoComplete="new-password"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-sm" aria-live="polite">{errors.confirm_password}</p>
            )}
          </div>
          <div className="flex justify-between mt-7">
            <Button type="button" onClick={() => setStep(2)}>Back</Button>
            <Button type="button" onClick={handleSubmit}>Register</Button>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default PasswordInfoForm;
