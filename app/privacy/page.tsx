"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Cookie, FileText, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/shared/Navbar"
import { useTheme } from "@/contexts/ThemeContext"

const privacyData = [
  {
    icon: Eye,
    title: "Information We Collect",
    content:
      "We collect information necessary to provide our educational services effectively, including when you interact with our AI-powered features.",
    details: [
      "Full name and contact information",
      "Email address for account management",
      "Course or subject preferences",
      "Login credentials (securely encrypted)",
      "Device and browser metadata for security",
      "Exam performance and academic progress data",
      "User inputs, queries, and interactions with AI features (for service improvement and safety)",
    ],
  },
  {
    icon: UserCheck,
    title: "How We Use Your Information",
    content:
      "Your data helps us provide personalized educational experiences, including AI-driven recommendations and support, and to improve our platform.",
    details: [
      "Provide personalized academic testing, progress tracking, and AI-powered study assistance",
      "Improve the quality, safety, and effectiveness of our platform and AI features",
      "Monitor usage patterns for performance optimization and AI model improvement",
      "Enhance security measures and prevent fraudulent activities",
      "Send important updates, reminders, and educational content",
      "Generate anonymized analytics for platform and AI system improvement",
      "Ensure responsible and ethical use of AI in accordance with legal and industry standards",
    ],
  },
  {
    icon: Lock,
    title: "Data Protection, Security & AI Safety",
    content:
      "We implement industry-standard security measures to protect your personal information and ensure the safe, ethical use of AI technologies.",
    details: [
      "End-to-end encryption for sensitive data transmission",
      "Secure server infrastructure with regular security updates",
      "Regular security audits and vulnerability assessments",
      "Strict access controls for our team members and AI system operators",
      "Automated backup systems to prevent data loss",
      "Compliance with international data protection standards (e.g., GDPR, CCPA)",
      "Continuous monitoring and review of AI systems to prevent misuse or bias",
      "User data used for AI training is anonymized and aggregated where possible",
    ],
  },
  {
    icon: Shield,
    title: "Your Privacy Rights",
    content:
      "You have full control over your personal data and how it's used on our platform, including data processed by AI systems.",
    details: [
      "Access and download your personal data at any time",
      "Request correction of inaccurate or incomplete information",
      "Delete your account and associated data permanently",
      "Opt-out of non-essential communications and marketing",
      "Withdraw consent for data processing, including AI-based processing, where applicable",
      "Request data portability to another service provider",
      "Request information about how your data is used in AI systems",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies, Tracking Technologies & AI Personalization",
    content:
      "We use cookies and similar technologies to enhance your user experience, platform functionality, and to personalize AI-driven features.",
    details: [
      "Essential cookies for platform functionality and security",
      "Performance cookies to analyze usage and improve services",
      "Functional cookies to remember your preferences and settings",
      "Analytics cookies to understand user behavior patterns and improve AI recommendations",
      "Session cookies that expire when you close your browser",
      "Persistent cookies that remain until manually deleted",
      "You can manage your cookie preferences at any time",
    ],
  },
  {
    icon: FileText,
    title: "Data Sharing, Third Parties & AI Providers",
    content:
      "We maintain strict policies regarding data sharing and third-party access to your information, including any AI service providers we use.",
    details: [
      "We never sell your personal data to third parties",
      "Limited sharing with trusted service providers and AI vendors under strict agreements",
      "Legal compliance sharing only when required by law",
      "Anonymous, aggregated data for research, AI model improvement, and platform enhancement",
      "Explicit consent required for any additional data sharing",
      "Regular audits of third-party and AI provider data handling practices",
      "AI service providers are contractually required to comply with our privacy and security standards",
    ],
  },
]

export default function PrivacyPolicyPage() {
  const [show, setShow] = useState(false)
  useTheme()

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 dark:bg-neutral-900 dark:border-neutral-800 transition-colors duration-300">
          <div className="container mx-auto px-4 py-16">
            <div
              className={`transform transition-all duration-700 ease-in-out ${
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Button
                variant="outline"
                asChild
                className="mb-8 bg-transparent border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 transition-colors duration-300"
              >
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 text-gray-900 dark:text-white" />
                  Back to Home
                </Link>
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gray-900 rounded-full dark:bg-neutral-800 transition-colors duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Privacy Policy
                  </h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
                  This Privacy Policy explains how we handle your information at{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">Operation Save My CGPA</span>. Your privacy is extremely
                  important to us, and we&apos;re committed to protecting your personal data—including data processed by our AI features—while providing you with the best educational experience. We use advanced security and privacy practices to ensure your information is safe, secure, and handled transparently.
                </p>
                <p className="text-base text-gray-500 dark:text-neutral-400 max-w-3xl mx-auto mt-4 leading-relaxed transition-colors duration-300">
                  <strong>Use of AI:</strong> Our platform uses artificial intelligence (AI) to enhance your learning experience, provide personalized recommendations, and support your academic journey. We are committed to the responsible, ethical, and secure use of AI, and we take extra care to protect your data in all AI-powered processes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div
            className={`transform transition-all duration-700 ease-in-out delay-200 ${
              show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Last Updated */}
            <Card className="mb-8 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <FileText className="h-5 w-5 dark:text-green-200" />
                    <span className="font-medium">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Current Version
                  </Badge>
                </div>
                <p className="text-green-700 dark:text-green-300 mt-2 text-sm transition-colors duration-300">
                  This policy is effective immediately and applies to all users of our platform, including those using AI-powered features.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-8">
              {privacyData.map((section, index) => {
                const IconComponent = section.icon
                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors duration-300"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg dark:bg-neutral-800 transition-colors duration-300">
                          <IconComponent className="h-5 w-5 text-gray-600 dark:text-white" />
                        </div>
                        <span className="text-xl text-gray-900 dark:text-white transition-colors duration-300">
                          {index + 1}. {section.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-neutral-300 transition-colors duration-300">
                        {section.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start gap-2 text-gray-700 dark:text-neutral-200 transition-colors duration-300"
                          >
                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-neutral-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Separator className="my-12 bg-gray-200 dark:bg-neutral-800 transition-colors duration-300" />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white transition-colors duration-300">
                    Policy Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-3 text-gray-700 dark:text-neutral-200 transition-colors duration-300">
                    This Privacy Policy may be updated periodically to reflect changes in our practices, legal requirements, or the introduction of new AI features. We will notify users of significant changes through:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-neutral-400 space-y-1 transition-colors duration-300">
                    <li>• Email notifications to registered users</li>
                    <li>• Platform announcements and notifications</li>
                    <li>• Updates on our website and social media</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white transition-colors duration-300">
                    International Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 transition-colors duration-300">
                    Our platform is accessible globally, and we comply with international privacy laws including GDPR for European users and other applicable data protection regulations. Data may be processed in different countries while maintaining the same level of protection, including for AI-powered services.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Related Policies */}
            <Card className="mb-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  Related Policies
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-neutral-300 transition-colors duration-300">
                  For complete information about our practices, please also review these related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    asChild
                    size="sm"
                    className="border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 transition-colors duration-300"
                  >
                    <Link href="/terms">Terms of Service</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    size="sm"
                    className="border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 transition-colors duration-300"
                  >
                    <Link href="/cookies">Cookies Policy</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    size="sm"
                    className="border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 transition-colors duration-300"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="bg-gray-900 text-white dark:bg-neutral-900 dark:text-white border border-gray-900 dark:border-neutral-800 transition-colors duration-300">
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Phone className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-bold">Privacy Questions or Concerns?</h3>
                </div>
                <p className="mb-6 max-w-2xl mx-auto text-gray-300 dark:text-neutral-300 transition-colors duration-300">
                  If you have questions about this Privacy Policy, want to exercise your privacy rights, or have concerns about how we handle your data—including data processed by AI features—please contact our privacy team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-green-900 text-green-200 hover:bg-green-800 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors duration-300"
                  >
                    <Link href="/contact">Contact Privacy Team</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800 transition-colors duration-300"
                  >
                    <a href="https://wa.me/2348083191228" target="_blank" rel="noopener noreferrer">
                      WhatsApp Support
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
