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

const PersonalInfoForm = () => {
  const { formData, setFormData, setStep } = useFormStore();
  return (
    <>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Fullname</Label>
            <Input
              id="fullname"
              name="fullname"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your fullname"
              required
              autoComplete="fullname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email address"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number</Label>
            <Input
              id="matricNumber"
              name="matricNumber"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, matricNumber: e.target.value })
              }
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>
        <div className="flex justify-end mt-7">
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      </CardContent>
    </>
  );
};

export default PersonalInfoForm;
