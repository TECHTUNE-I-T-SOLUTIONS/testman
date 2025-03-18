import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFormStore from "@/lib/store/useStudentFormStore";

const InstitutionalInfoForm = () => {
  const { setStep } = useFormStore();

  return (
    <>
      <CardHeader>
        <CardTitle>Institutional Details</CardTitle>
        <CardDescription>Enter your Institutional Information</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {/* Faculty Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="faculty">Faculty</Label>
            <Select>
              <SelectTrigger id="faculty">
                <SelectValue placeholder={"Select Faculty"} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Communication and Information Science">
                  Communication and Information Science
                </SelectItem>
                <SelectItem value="Social Science">Social Science</SelectItem>
                <SelectItem value="Physical Science">
                  Physical Science
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Select>
              <SelectTrigger id="department">
                <SelectValue placeholder={"Select Department"} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Library and Information Science">
                  Library and Information Science
                </SelectItem>
                <SelectItem value="Mass Communication">
                  Mass Communication
                </SelectItem>
                <SelectItem value="Computer Science">
                  Computer Science
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="level">Level</Label>
            <Select>
              <SelectTrigger id="level">
                <SelectValue placeholder={"Select Level"} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="400">400</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <div className="flex justify-between mt-7">
        <Button onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)}>Continue</Button>
        </div>
      </CardContent>
    </>
  );
};

export default InstitutionalInfoForm;
