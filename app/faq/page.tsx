"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, HelpCircle, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/shared/Navbar"
import { useTheme } from "@/contexts/ThemeContext"

export function useThemeAwareStyles() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return { theme, mounted }
}

const faqs = [
  {
    question: "What is this platform about?",
    answer:
      "Our platform is a CGPA-building exam/test website designed to help students test themselves on their academic courses through practice exams, timed quizzes, and performance tracking.",
    category: "General",
  },
  {
    question: "How do I register?",
    answer:
      "Click on the 'Register' button on the homepage, fill in your details. Once done, you'll be redirected to your dashboard.",
    category: "Account",
  },
  {
    question: "Is the platform free?",
    answer:
      "Yes! Most features are completely free. However, some premium features may require a subscription for extended functionality and advanced analytics.",
    category: "Pricing",
  },
  {
    question: "How can I take an exam?",
    answer:
      "After logging in, go to your dashboard and select 'Take Exam'. Choose a subject or course, then start the test. Your results will be shown immediately after completion.",
    category: "Exams",
  },
  {
    question: "How are my scores calculated?",
    answer:
      "Your scores are based on correct answers and time taken. They contribute to performance stats visible on your dashboard, helping you track your academic growth.",
    category: "Scoring",
  },
  {
    question: "Can I review my past exams?",
    answer:
      "Yes, your exam history is saved. Go to 'My Results' on your dashboard to review your scores, answers, and improvements over time.",
    category: "Results",
  },
  {
    question: "Are the questions based on real exams?",
    answer:
      "Most of our questions are curated from past papers, class notes, and verified by educators. They reflect real exam patterns to help you prepare effectively.",
    category: "Content",
  },
  {
    question: "How secure is my data?",
    answer:
      "We take data privacy seriously. All your personal and academic information is securely stored and never shared with third parties.",
    category: "Security",
  },
  {
    question: "Can I use this for all my courses?",
    answer:
      "Yes. The platform supports a wide range of departments and courses. More are being added regularly based on student demand.",
    category: "Courses",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "If you encounter any issues, reach out via the 'Contact Us' page or the admin on WhatsApp. We're here to help!",
    category: "Support",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Theme-aware styles
  const { mounted } = useThemeAwareStyles();

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)))

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? null : index)
  }

  // Wait for mount to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gray-900 dark:bg-white rounded-full transition-colors duration-300">
                <HelpCircle className="h-8 w-8 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto transition-colors duration-300">
              Find answers to common questions about Operation Save My CGPA. Can&apos;t find what you&apos;re looking for?
              <span className="text-gray-900 dark:text-white font-medium"> Contact our support team.</span>
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8 bg-white dark:bg-gray-800 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
              <CardDescription className="dark:text-gray-200">Search through our FAQ or filter by category to find what you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search questions and answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-900 dark:text-white transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === null
                      ? "bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory === category
                        ? "bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Results */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No FAQs Found</h3>
                  <p className="text-gray-600 dark:text-gray-200 max-w-md">
                    Try adjusting your search terms or removing filters to find what you&apos;re looking for.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden transition-shadow hover:shadow-md bg-white dark:bg-gray-800 transition-colors duration-300">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-inset"
                  >
                    <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white text-left">{faq.question}</CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          {openIndex === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </button>
                  {openIndex === index && (
                    <CardContent className="pt-0 pb-6">
                      <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{faq.answer}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Still Need Help Section */}
          <Card className="mt-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-colors duration-300">
            <CardContent className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
              <p className="text-gray-300 dark:text-gray-700 mb-6 max-w-2xl mx-auto">
                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="https://wa.me/2348083191228"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 dark:border-gray-300 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  WhatsApp Chat
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
