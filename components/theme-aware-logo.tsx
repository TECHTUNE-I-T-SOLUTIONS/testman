
"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/ThemeContext"

interface ThemeAwareLogoProps {
  width?: number
  height?: number
  className?: string
}

export function ThemeAwareLogo({ width = 32, height = 32, className = "" }: ThemeAwareLogoProps) {
  const { theme } = useTheme()
  
  // Determine if we should use dark logo (white version)
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/Operation-save-my-CGPA-07.svg"
        alt="Operation Save My CGPA Logo"
        width={width}
        height={height}
        className={`transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`}
      />
      <Image
        src="/Operation-save-my-CGPA-07-white.svg"
        alt="Operation Save My CGPA Logo"
        width={width}
        height={height}
        className={`absolute top-0 left-0 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
