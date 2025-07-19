"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { ComponentProps } from "react"

export default function ThemeAwareLogo(props: ComponentProps<typeof Image>) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute logoSrc based on theme and mounted
  const logoSrc = mounted
    ? theme === "dark"
      ? "/darklogo.svg"
      : "/Operation-save-my-CGPA-07.svg"
    : "/Operation-save-my-CGPA-07.svg";

  if (!mounted) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { width, height, className, alt, src, ...rest } = props
  return (
    <Image
      key={theme}
      src={logoSrc}
      alt={alt || "Logo"}
      width={width || 40}
      height={height || 40}
      className={className}
      {...rest}
    />
  )
}