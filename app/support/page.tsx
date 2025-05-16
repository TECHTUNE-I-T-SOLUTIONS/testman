// app/support/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getStudentFromToken } from "@/utils/auth";
import Link from "next/link";
import { X, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { FaWhatsapp, FaDonate } from "react-icons/fa";

export default function SupportPage() {
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

      <div className="min-h-screen bg-gray-50 px-6 py-12 md:px-20 lg:px-40">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-700 mb-8">
          💜 Support Operation Save My CGPA
        </h1>

        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-10">
          We&apos;re committed to helping students prepare better, improve their grades, and build stronger CGPAs through consistent practice, realistic exam simulations, and academic motivation.
          Your donation or support keeps this mission alive and accessible to everyone. 🙌
        </p>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Ways You Can Support</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Make a one-time donation via bank transfer or mobile money</li>
                <li>Spread the word about <strong>Operation Save My CGPA</strong></li>
                <li>Offer volunteering or content contribution</li>
                <li>Give us a shoutout on social media!</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg w-full md:max-w-sm text-center space-y-4">
              <FaDonate className="text-4xl text-purple-600 mx-auto" />
              <h3 className="text-lg font-semibold text-purple-700">Donation Info</h3>
              <p className="text-gray-800">
                <strong>BANK DETAILS WILL BE UPDATED SOON</strong><br />
                MEANWHILE, YOU CAN REACH THE ADMIN
                {/*<strong>Bank Name:</strong> GTBank<br />*/}
                {/*<strong>Account Name:</strong> Operation Save my CGPA<br />*/}
                {/*<strong>Account Number:</strong> 0123456789*/}
                </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact the Admin Directly
            </h2>
            <a
              href="https://wa.me/2348083191228"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full text-lg font-medium shadow-lg transition duration-200"
            >
              <FaWhatsapp className="mr-2 text-2xl" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
