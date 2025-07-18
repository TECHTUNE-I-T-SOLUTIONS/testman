"use client"

import { MessageCircle, Phone, Clock, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/shared/Navbar"
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"

// Theme-aware hook (same as in support/faq)
function useThemeAwareStyles() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return { theme, mounted }
}

const contactMethods = [
  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    description: "Chat with our admin directly for instant support",
    detail: "+234 808 319 1228",
    action: "Message Now",
    href: "https://wa.me/2348083191228",
    color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    buttonColor: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
  },
  {
    icon: FaEnvelope,
    title: "Email",
    description: "Send us a detailed message via email",
    detail: "support@operationsavemycgpa.com",
    action: "Send Email",
    href: "mailto:support@operationsavemycgpa.com",
    color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
    buttonColor: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
  },
]

const quickLinks = [
  { title: "Technical Support", description: "Platform issues, login problems, exam difficulties" },
  { title: "Account Questions", description: "Registration, profile updates, account activation" },
  { title: "Course Content", description: "Missing courses, question feedback, content suggestions" },
  { title: "General Inquiries", description: "Platform features, partnerships, collaboration" },
]

export default function ContactPage() {
  const { mounted } = useThemeAwareStyles();

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
                <MessageCircle className="h-8 w-8 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Contact Us</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
              Have a question, suggestion, or need support? We&apos;re here to help you succeed in building your CGPA.
              <span className="text-gray-900 dark:text-white font-medium">
                {" "}
                Reach out to us and we&apos;ll get back to you as soon as possible.
              </span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <Card key={index} className={`border-2 ${method.color} hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg transition-colors duration-300">
                        <IconComponent className="text-2xl" />
                      </div>
                      {method.title}
                    </CardTitle>
                    <CardDescription className="text-gray-700 dark:text-gray-200 transition-colors duration-300">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg transition-colors duration-300">
                      <p className="font-mono text-sm text-gray-900 dark:text-white">{method.detail}</p>
                    </div>
                    <Button asChild className={`w-full ${method.buttonColor} text-white dark:text-white`} size="lg">
                      <a
                        href={method.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <IconComponent className="text-lg" />
                        {method.action}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Help Topics */}
          <Card className="mb-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white transition-colors duration-300">What can we help you with?</CardTitle>
              <CardDescription className="text-lg text-gray-700 dark:text-gray-200 transition-colors duration-300">Common topics our support team can assist you with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickLinks.map((link, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-300"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{link.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-300">{link.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Hours & Response Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">Monday - Friday</span>
                  <span className="font-medium text-gray-900 dark:text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">Saturday</span>
                  <span className="font-medium text-gray-900 dark:text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">Sunday</span>
                  <span className="font-medium text-gray-900 dark:text-white">Closed</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">* All times are in West Africa Time (WAT)</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                  <Send className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">WhatsApp</span>
                  <span className="font-medium text-green-600 dark:text-green-300">Within 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">Email</span>
                  <span className="font-medium text-blue-600 dark:text-blue-300">Within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-200">Urgent Issues</span>
                  <span className="font-medium text-red-600 dark:text-red-400">Immediate</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">* Response times may vary during peak periods</p>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 transition-colors duration-300">
            <CardContent className="text-center py-8">
              <div className="p-3 bg-red-100 dark:bg-red-800 rounded-full w-fit mx-auto mb-4 transition-colors duration-300">
                <Phone className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2 transition-colors duration-300">Urgent Technical Issues?</h3>
              <p className="text-red-700 dark:text-red-200 mb-4 transition-colors duration-300">
                If you&apos;re experiencing critical platform issues during an exam or urgent academic deadline, contact us
                immediately via WhatsApp for priority support.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white" size="lg">
                <a
                  href="https://wa.me/2348083191228?text=URGENT:%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Emergency Contact
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
