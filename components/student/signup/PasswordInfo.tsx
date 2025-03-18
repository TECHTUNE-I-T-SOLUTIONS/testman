"use client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFormStore from "@/lib/store/useStudentFormStore";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const PasswordInfoForm = () => {
  const { setStep } = useFormStore();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <CardHeader>
        <CardTitle>Password Information</CardTitle>
        <CardDescription>Create pasword for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              autoComplete="password"
            />
          </div>
        </form>
        <div className="flex justify-between mt-7">
        <Button onClick={() => setStep(2)}>Back</Button>
        <Button>Register</Button>
        </div>
      </CardContent>
    </>
  );
};

export default PasswordInfoForm;
