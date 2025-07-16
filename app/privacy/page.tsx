"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Cookie, FileText, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/shared/Navbar"

const privacyData = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: "We collect information necessary to provide our educational services effectively.",
    details: [
      "Full name and contact information",
      "Email address for account management",
      "Course or subject preferences",
      "Login credentials (securely encrypted)",
      "Device and browser metadata for security",
      "Exam performance and academic progress data",
    ],
  },
  {
    icon: UserCheck,
    title: "How We Use Your Information",
    content: "Your data helps us provide personalized educational experiences and improve our platform.",
    details: [
      "Provide personalized academic testing and progress tracking",
      "Improve the quality and effectiveness of our platform",
      "Monitor usage patterns for performance optimization",
      "Enhance security measures and prevent fraudulent activities",
      "Send important updates, reminders, and educational content",
      "Generate anonymized analytics for platform improvement",
    ],
  },
  {
    icon: Lock,
    title: "Data Protection & Security",
    content: "We implement industry-standard security measures to protect your personal information.",
    details: [
      "End-to-end encryption for sensitive data transmission",
      "Secure server infrastructure with regular security updates",
      "Regular security audits and vulnerability assessments",
      "Strict access controls for our team members",
      "Automated backup systems to prevent data loss",
      "Compliance with international data protection standards",
    ],
  },
  {
    icon: Shield,
    title: "Your Privacy Rights",
    content: "You have full control over your personal data and how it's used on our platform.",
    details: [
      "Access and download your personal data at any time",
      "Request correction of inaccurate or incomplete information",
      "Delete your account and associated data permanently",
      "Opt-out of non-essential communications and marketing",
      "Withdraw consent for data processing where applicable",
      "Request data portability to another service provider",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking Technologies",
    content: "We use cookies and similar technologies to enhance your user experience and platform functionality.",
    details: [
      "Essential cookies for platform functionality and security",
      "Performance cookies to analyze usage and improve services",
      "Functional cookies to remember your preferences and settings",
      "Analytics cookies to understand user behavior patterns",
      "Session cookies that expire when you close your browser",
      "Persistent cookies that remain until manually deleted",
    ],
  },
  {
    icon: FileText,
    title: "Data Sharing & Third Parties",
    content: "We maintain strict policies regarding data sharing and third-party access to your information.",
    details: [
      "We never sell your personal data to third parties",
      "Limited sharing with trusted service providers under strict agreements",
      "Legal compliance sharing only when required by law",
      "Anonymous, aggregated data for research and improvement purposes",
      "Explicit consent required for any additional data sharing",
      "Regular audits of third-party data handling practices",
    ],
  },
]

export default function PrivacyPolicyPage() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <div
              className={`transform transition-all duration-700 ease-in-out ${
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
                  <div className="p-3 bg-gray-900 rounded-full">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Privacy Policy</h1>
                </div>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  This Privacy Policy explains how we handle your information at{" "}
                  <span className="font-semibold text-gray-900">Operation Save My CGPA</span>. Your privacy is very
                  important to us, and we&apos;re committed to protecting your personal data while providing you with the
                  best educational experience.
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
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Current Version
                  </Badge>
                </div>
                <p className="text-green-700 mt-2 text-sm">
                  This policy is effective immediately and applies to all users of our platform.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-8">
              {privacyData.map((section, index) => {
                const IconComponent = section.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="text-xl">
                          {index + 1}. {section.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-base">{section.content}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-gray-700">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Separator className="my-12" />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Policy Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    This Privacy Policy may be updated periodically to reflect changes in our practices or legal
                    requirements. We will notify users of significant changes through:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Email notifications to registered users</li>
                    <li>• Platform announcements and notifications</li>
                    <li>• Updates on our website and social media</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">International Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Our platform is accessible globally, and we comply with international privacy laws including GDPR
                    for European users and other applicable data protection regulations. Data may be processed in
                    different countries while maintaining the same level of protection.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Related Policies */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Related Policies</CardTitle>
                <CardDescription>
                  For complete information about our practices, please also review these related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild size="sm">
                    <Link href="/terms">Terms of Service</Link>
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/cookies">Cookies Policy</Link>
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="bg-gray-900 text-white">
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Phone className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Privacy Questions or Concerns?</h3>
                </div>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  If you have questions about this Privacy Policy, want to exercise your privacy rights, or have
                  concerns about how we handle your data, please contact our privacy team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link href="/contact">Contact Privacy Team</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
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
