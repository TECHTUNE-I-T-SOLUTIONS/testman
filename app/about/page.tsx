// app/about/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getStudentFromToken } from "@/utils/auth";
import Link from "next/link";
import { X, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutPage() {
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

	  <div className="min-h-screen px-6 py-12 bg-white text-gray-800">
	      <div className="max-w-4xl mx-auto">
	        <h1 className="text-4xl font-bold mb-6 text-blue-800">
	          Operation Save My CGPA
	        </h1>

	        <section className="mb-8">
	          <h2 className="text-2xl font-semibold mb-2">What is this initiative?</h2>
	          <p className="text-lg leading-relaxed">
	            <strong>Operation Save My CGPA</strong> is an academic support initiative designed to help students who are at risk of academic failure or are struggling with low performance. The aim is to provide timely intervention through tutoring, mentorship, structured study sessions, and access to academic resources.
	          </p>
	        </section>

	        <section className="mb-8">
	          <h2 className="text-2xl font-semibold mb-2">Objectives</h2>
	          <ul className="list-disc list-inside text-lg leading-relaxed space-y-1">
	            <li>Assist students in improving their academic performance.</li>
	            <li>Reduce the number of students on probation or academic warning.</li>
	            <li>Provide targeted help in challenging courses.</li>
	            <li>Promote a culture of academic excellence and peer support.</li>
	          </ul>
	        </section>

	        <section className="mb-8">
	          <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
	          <ol className="list-decimal list-inside text-lg leading-relaxed space-y-1">
	            <li>Students register or are nominated based on performance or request.</li>
	            <li>A personalized improvement plan is created for each student.</li>
	            {/*<li>Students are paired with tutors or mentors for academic guidance.</li>*/}
	            <li>Progress is tracked regularly through performance reviews.</li>
	          </ol>
	        </section>
	 
			<section className="mb-8">
			  <h2 className="text-2xl font-semibold mb-2">Who Can Benefit?</h2>
			  <p className="text-lg leading-relaxed">
			    This program is designed for all students, especially those who:
			  </p>
			  <ul className="list-disc list-inside text-lg leading-relaxed mt-2 space-y-1">
			    <li>Have a CGPA below 2.5 and want to improve.</li>
			    <li>Struggle with time management or exam anxiety.</li>
			    <li>Are committed to turning their academic journey around.</li>
			  </ul>
			</section>

	        <section>
	          <h2 className="text-2xl font-semibold mb-2">Get Involved</h2>
	          <p className="text-lg leading-relaxed">
	            Whether you are a student in need, a mentor, a tutor, or just someone passionate about academic success, we invite you to be part of this life-changing initiative. Together, we can save CGPAs and build a brighter future.
	          </p>
	        </section>
	      </div>
	  </div>
	</>
  );
}
