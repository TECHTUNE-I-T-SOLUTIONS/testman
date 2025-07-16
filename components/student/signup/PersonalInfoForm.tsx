"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useFormStore from "@/lib/store/useStudentFormStore"

const PersonalInfoForm = () => {
  const { formData, setFormData, setStep } = useFormStore()

  return (
    <>
      <CardHeader className="space-y-4 pb-8">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Personal Information</CardTitle>
          <CardDescription className="text-slate-600">Let&apos;s start with your basic information</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-sm font-medium text-slate-700">
              Full Name
            </Label>
            <Input
              id="fullname"
              name="fullname"
              type="text"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
              autoComplete="name"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricNumber" className="text-sm font-medium text-slate-700">
              Matric Number
            </Label>
            <Input
              id="matricNumber"
              name="matricNumber"
              type="text"
              onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
              placeholder="Enter your matric number"
              required
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Enter your phone number"
              required
              autoComplete="tel"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="button"
            onClick={() => setStep(2)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default PersonalInfoForm
