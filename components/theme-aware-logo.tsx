"use client"

import { useTheme } from "next-themes"
import Image from "next/image"

interface ThemeAwareLogoProps {
  className?: string
  width?: number
  height?: number
}

export function ThemeAwareLogo({ 
  className = "",
  width = 120,
  height = 40,
}: ThemeAwareLogoProps) {
  const { theme } = useTheme()

  return (
    <Image
      src={theme === "dark" ? "/darklogo.svg" : "/Operation-save-my-CGPA-07.svg"}
      alt="Operation Save My CGPA Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}