import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import type React from "react"

const SignupPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full max-w-2xl">
      {children}
      <CardFooter className="w-full flex justify-center pt-6 bg-transparent">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-slate-900 hover:text-slate-700 hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </div>
  )
}

export default SignupPage
