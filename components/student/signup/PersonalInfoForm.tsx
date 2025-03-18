"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFormStore from "@/lib/store/useStudentFormStore";

const PersonalInfoForm = () => {
  const {setStep} = useFormStore();
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="fullname">Fullname</Label>
            <Input
              id="fullname"
              name="fullname"
              type="text"
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
              placeholder="Enter your email address"
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => setStep(2)}>Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalInfoForm;
