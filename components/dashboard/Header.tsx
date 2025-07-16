"use client"

import type React from "react"

interface HeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ title, description, icon }) => {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
