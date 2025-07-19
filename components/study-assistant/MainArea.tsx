import React from "react"

interface MainAreaProps {
  children: React.ReactNode
  className?: string
}

export default function MainArea({ children, className = "" }: MainAreaProps) {
  return (
    <main className={`flex flex-col flex-1 h-full min-h-0 ${className}`}>
      {children}
    </main>
  )
} 