"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Info, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/shared/Navbar"

// Theme-aware styles hook (copied from support/page.tsx)
import { useTheme } from "@/contexts/ThemeContext"
function useThemeAwareStyles() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return { theme, mounted }
}

const cookieTypes = [
  {
    icon: Shield,
    title: "Essential Cookies",
    description: "Required for basic platform functionality and security",
    color: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200",
    badge: "Required",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    examples: [
      "User authentication and session management",
      "Security tokens and CSRF protection",
      "Platform functionality and navigation",
      "Form submission and data validation",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics Cookies",
    description: "Help us understand user behavior and improve our services",
    color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200",
    badge: "Optional",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    examples: [
      "Page views and user interaction tracking",
      "Performance monitoring and error reporting",
      "Feature usage statistics and patterns",
      "Platform optimization and improvement data",
    ],
  },
  {
    icon: Settings,
    title: "Functional Cookies",
    description: "Remember your preferences and enhance user experience",
    color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200",
    badge: "Optional",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    examples: [
      "Language and region preferences",
      "Theme and display settings",
      "Sidebar and layout configurations",
      "Notification and communication preferences",
    ],
  },
]

const cookieManagement = [
  {
    browser: "Chrome",
    steps: "Settings → Privacy and security → Cookies and other site data → See all cookies and site data",
  },
  {
    browser: "Firefox",
    steps: "Settings → Privacy & Security → Cookies and Site Data → Manage Data",
  },
  {
    browser: "Safari",
    steps: "Preferences → Privacy → Manage Website Data",
  },
  {
    browser: "Edge",
    steps: "Settings → Cookies and site permissions → Cookies and site data → See all cookies and site data",
  },
]

export default function CookiesPolicyPage() {
  const [show, setShow] = useState(false)
  const { mounted } = useThemeAwareStyles()

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  // Wait for mount to avoid hydration mismatch
  if (!mounted) return null

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="container mx-auto px-4 py-16">
            <div
              className={`transform transition-all duration-700 ease-in-out ${
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Button variant="outline" asChild className="mb-8 bg-transparent dark:bg-transparent">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gray-900 dark:bg-white rounded-full transition-colors duration-300">
                    <Cookie className="h-8 w-8 text-white dark:text-gray-900" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Cookies Policy
                  </h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-200 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
                  This Cookies Policy explains how{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">Operation Save My CGPA</span> uses cookies and similar
                  technologies to recognize you when you visit our website and enhance your educational experience.
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
            {/* What Are Cookies */}
            <Card className="mb-8 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                  Cookies are small data files that are placed on your computer or mobile device when you visit a
                  website. They are widely used by website owners to make their websites work more efficiently, provide
                  a better user experience, and gather analytical information about website usage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors duration-300">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Session Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Temporary cookies that expire when you close your browser. Used for essential functionality.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors duration-300">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Persistent Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Remain on your device until they expire or are manually deleted. Used for preferences and
                      analytics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <div className="space-y-6 mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Types of Cookies We Use</h2>
                <p className="text-gray-600 dark:text-gray-200 transition-colors duration-300">
                  We use different types of cookies to provide and improve our educational platform
                </p>
              </div>

              {cookieTypes.map((type, index) => {
                const IconComponent = type.icon
                return (
                  <Card
                    key={index}
                    className={`border-2 ${type.color} hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-opacity-80 transition-colors duration-300`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-900 rounded-lg transition-colors duration-300">
                            <IconComponent className="h-5 w-5 text-inherit" />
                          </div>
                          <span className="transition-colors duration-300">{type.title}</span>
                        </CardTitle>
                        <Badge className={type.badgeColor}>{type.badge}</Badge>
                      </div>
                      <CardDescription className="text-base text-gray-700 dark:text-gray-200 transition-colors duration-300">{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {type.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-300">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Cookie Management */}
            <Card className="mb-8 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                  Managing Your Cookie Preferences
                </CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-200">You have control over which cookies are stored on your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Browser Settings</h4>
                  <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                    You can manage cookies through your browser settings. Here&apos;s how to access cookie settings in
                    popular browsers:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cookieManagement.map((browser, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">{browser.browser}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{browser.steps}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Impact of Disabling Cookies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900 dark:border-amber-700 rounded-lg transition-colors duration-300">
                      <h5 className="font-medium text-amber-800 dark:text-amber-100 mb-2">Essential Cookies</h5>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        Disabling these may prevent core platform functionality, login capabilities, and security
                        features.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700 rounded-lg transition-colors duration-300">
                      <h5 className="font-medium text-blue-800 dark:text-blue-100 mb-2">Optional Cookies</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Disabling these will limit personalization and our ability to improve the platform based on
                        usage data.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Cookies */}
            <Card className="mb-8 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Third-Party Services</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-200">We may use trusted third-party services that also set cookies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analytics Services</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      We may use analytics services to understand how users interact with our platform. These services
                      may set their own cookies to track user behavior across websites.
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Educational Content Providers</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      Some educational content may be provided by third-party services that use cookies to enhance the
                      learning experience and track progress.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Updates */}
            <Card className="mb-8 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                  We may update this Cookies Policy from time to time to reflect changes in our practices, technology,
                  or legal requirements. We encourage users to review it periodically for any changes.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Badge variant="secondary">Last updated: {new Date().toLocaleDateString()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="bg-gray-900 dark:bg-gray-900 text-white dark:text-white transition-colors duration-300">
              <CardContent className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Phone className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Questions About Cookies?</h3>
                </div>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  If you have questions about this Cookies Policy or how we use cookies on our platform, please contact
                  our support team for assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-800 bg-transparent"
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
