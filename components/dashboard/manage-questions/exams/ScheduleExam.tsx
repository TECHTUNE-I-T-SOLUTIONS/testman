import type { UseFormRegister } from "react-hook-form"
import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface ExamFormData {
  courseId: string
  title: string
  duration: number
  selectedQuestions: string[]
  scheduleDate?: string
}

interface ScheduleExamProps {
  isScheduling: boolean
  setIsScheduling: (value: boolean) => void
  register: UseFormRegister<ExamFormData>
}

export default function ScheduleExam({ isScheduling, setIsScheduling, register }: ScheduleExamProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="schedule" checked={isScheduling} onCheckedChange={setIsScheduling} />
            <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
              <Calendar className="h-4 w-4" />
              Schedule Exam for Later
            </Label>
          </div>

          {isScheduling && (
            <div className="space-y-2">
              <Label htmlFor="scheduleDate">Schedule Date & Time</Label>
              <Input id="scheduleDate" type="datetime-local" {...register("scheduleDate")} className="w-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
