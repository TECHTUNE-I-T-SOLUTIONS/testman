"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/shared/Navbar"
import { useTheme } from "@/contexts/ThemeContext"

// Theme-aware hook (same as in support/faq/contact)
function useThemeAwareStyles() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return { theme, mounted }
}

const termsData = [
  {
    icon: Users,
    title: "User Responsibilities",
    content:
      "Users are expected to use the platform responsibly and respectfully. Any misuse of the testing system or platform features may lead to suspension or permanent ban. You must provide accurate information during registration and maintain the confidentiality of your account credentials.",
  },
  {
    icon: Shield,
    title: "Data Privacy",
    content:
      "We collect and store necessary user data to enhance your learning experience. Your data will not be shared with third parties except as required by law. We implement industry-standard security measures to protect your personal information and academic records.",
  },
  {
    icon: FileText,
    title: "Intellectual Property",
    content:
      "All content on this platform, including questions, designs, course materials, and software, is owned by Operation Save My CGPA or its licensors. Unauthorized reproduction, distribution, or commercial use of any content is strictly prohibited without written permission.",
  },
  {
    icon: AlertTriangle,
    title: "Limitations of Liability",
    content:
      "We are not responsible for any loss or damage caused by your reliance on information from this platform. We provide no guarantees of academic performance improvement. The platform is provided 'as is' without warranties of any kind, express or implied.",
  },
  {
    icon: Scale,
    title: "Modifications",
    content:
      "These terms may be updated from time to time to reflect changes in our services or legal requirements. Users will be notified of any major changes via email or platform notifications. Continued use of the platform implies acceptance of the updated terms.",
  },
  {
    icon: Phone,
    title: "Contact & Support",
    content:
      "For any concerns, questions, or disputes regarding these terms, contact us via WhatsApp or email. We are committed to resolving any issues promptly and fairly. Our support team is available during business hours to assist you.",
  },
]

export default function TermsPage() {
  const [showContent, setShowContent] = useState(false)
  const { mounted } = useThemeAwareStyles();

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  // Wait for mount to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="container mx-auto px-4 py-16">
            <div
              className={`transform transition-all duration-700 ease-in-out ${
                showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Button variant="outline" asChild className="mb-8 bg-transparent">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gray-900 dark:bg-white rounded-full transition-colors duration-300">
                    <Scale className="h-8 w-8 text-white dark:text-gray-900" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Terms of Service
                  </h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
                  Welcome to <span className="font-semibold text-gray-900 dark:text-white">Operation Save My CGPA</span>. By accessing
                  or using our platform, you agree to the following terms. Please read them carefully before using our
                  services.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div
            className={`transform transition-all duration-700 ease-in-out delay-200 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Last Updated */}
            <Card className="mb-8 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-blue-700 dark:text-blue-100 mt-2 text-sm">
                  These terms are effective immediately and apply to all users of the platform.
                </p>
              </CardContent>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-6">
              {termsData.map((section, index) => {
                const IconComponent = section.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 transition-colors duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-300">
                          <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                        </div>
                        <span className="text-xl text-gray-900 dark:text-white transition-colors duration-300">
                          {index + 1}. {section.title}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed transition-colors duration-300">{section.content}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Separator className="my-12" />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white transition-colors duration-300">Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed transition-colors duration-300">
                    By creating an account or using any part of our platform, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white transition-colors duration-300">Governing Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed transition-colors duration-300">
                    These terms are governed by the laws of Nigeria. Any disputes will be resolved through appropriate
                    legal channels within the jurisdiction of Nigerian courts.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Section */}
            <Card className="mt-8 bg-gray-900 dark:bg-gray-900 text-white dark:text-white transition-colors duration-300">
              <CardContent className="text-center py-8">
                <h3 className="text-xl font-bold mb-4">Questions About These Terms?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  If you have any questions or concerns about these Terms of Service, please don&apos;t hesitate to contact
                  our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-800 bg-transparent hover:text-white"
                  >
                    <a href="https://wa.me/2348083191228" target="_blank" rel="noopener noreferrer">
                      WhatsApp Chat
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
