import React from "react"

const SignupPage = ({children}: {children:React.ReactNode}) => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">{children}
    </main>
  )
}

export default SignupPage