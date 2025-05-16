// app/contact/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getStudentFromToken } from "@/utils/auth";
import Link from "next/link";
import { X, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    // Example: Check localStorage or session for auth token
    const getToken = async () => {
      const token = await getStudentFromToken()
      getStudentFromToken()
      setIsLoggedIn(!!token);
    }
    getToken();
  }, []);

  return (
    <>
      {/* Navbar */}    
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-4 pr-4">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/Operation-save-my-CGPA-07.svg"
              alt="Operation Save My CGPA Logo"
              width={30}
              height={30}
              className="h-15 w-15"
            />
            <span className="text-xl font-bold tracking-tight">
              Operation Save My CGPA
            </span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-2 mr-2">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Button asChild>
                <Link href="/student">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="ml-4 mr-4 md:hidden border-t">
            <div className="container py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>

              <div className="pt-2 border-t flex flex-col gap-2">
                {isLoggedIn ? (
                  <Button className="w-full" asChild>
                    <Link href="/student">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="min-h-screen bg-white px-6 py-12 md:px-20 lg:px-40">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-700 mb-8">
          📬 Contact Us
        </h1>

        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-10">
          Have a question, suggestion, or need support? We&apos;re here to help you succeed in building your CGPA. Reach out to us via WhatsApp or email.
        </p>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* WhatsApp Contact */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FaWhatsapp className="text-green-500 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">WhatsApp</h3>
                <p className="text-gray-600">Chat with the admin directly</p>
              </div>
            </div>
            <a
              href="https://wa.me/2348083191228"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-full transition"
            >
              Message Now
            </a>
          </div>

          {/* Email Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-blue-500 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">Send us an email at:</p>
                <span className="text-blue-600 font-semibold">
                  {/* TODO: Insert your real email below */}
                  your-email@example.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>      
  );
}
