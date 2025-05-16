// app/faq/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getStudentFromToken } from "@/utils/auth";
import Link from "next/link";
import { X, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const faqs = [
  {
    question: "What is this platform about?",
    answer:
      "Our platform is a CGPA-building exam/test website designed to help students test themselves on their academic courses through practice exams, timed quizzes, and performance tracking.",
  },
  {
    question: "How do I register?",
    answer:
      "Click on the 'Register' button on the homepage, fill in your details. Once done, you’ll be redirected to your dashboard.",
  },
  {
    question: "Is the platform free?",
    answer:
      "Yes! Most features are completely free. However, some premium features may require a subscription for extended functionality and advanced analytics.",
  },
  {
    question: "How can I take an exam?",
    answer:
      "After logging in, go to your dashboard and select 'Take Exam'. Choose a subject or course, then start the test. Your results will be shown immediately after completion.",
  },
  {
    question: "How are my scores calculated?",
    answer:
      "Your scores are based on correct answers and time taken. They contribute to performance stats visible on your dashboard, helping you track your academic growth.",
  },
  {
    question: "Can I review my past exams?",
    answer:
      "Yes, your exam history is saved. Go to 'My Results' on your dashboard to review your scores, answers, and improvements over time.",
  },
  {
    question: "Are the questions based on real exams?",
    answer:
      "Most of our questions are curated from past papers, class notes, and verified by educators. They reflect real exam patterns to help you prepare effectively.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We take data privacy seriously. All your personal and academic information is securely stored and never shared with third parties.",
  },
  {
    question: "Can I use this for all my courses?",
    answer:
      "Yes. The platform supports a wide range of departments and courses. More are being added regularly based on student demand.",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "If you encounter any issues, reach out via the 'Contact Us' page or the admin on whatsapp. We’re here to help!",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

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

      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-10 lg:px-32">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-10">
          ❓ Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-purple-200 rounded-lg shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
              >
                <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                <span className="text-purple-500 text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
