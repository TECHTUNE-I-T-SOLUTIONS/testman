"use client"

import React, { useState, useEffect } from 'react';
import { getStudentFromToken } from "@/utils/auth"
import Link from "next/link"
import { X, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeAwareLogo } from "@/components/theme-aware-logo"

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const getToken = async () => {
      const token = await getStudentFromToken()
      setIsLoggedIn(!!token)
    }
    getToken()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ThemeAwareLogo width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Operation Save My CGPA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            FAQ
          </Link>
          <Link href="/support" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Support
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button asChild className="bg-gray-900 hover:bg-gray-800">
              <Link href="/student">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild className="border-gray-200 bg-transparent">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-gray-900 hover:bg-gray-800">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq"
                className="flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/support"
                className="flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
                <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
              {isLoggedIn ? (
                <Button className="w-full bg-gray-900 hover:bg-gray-800" asChild>
                  <Link href="/student">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full border-gray-200 bg-transparent" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
               <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}