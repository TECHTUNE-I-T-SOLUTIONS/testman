"use client"

import { MessageCircle, Phone, Clock, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/shared/Navbar"
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"

const contactMethods = [
  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    description: "Chat with our admin directly for instant support",
    detail: "+234 808 319 1228",
    action: "Message Now",
    href: "https://wa.me/2348083191228",
    color: "bg-green-50 border-green-200 text-green-800",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  {
    icon: FaEnvelope,
    title: "Email",
    description: "Send us a detailed message via email",
    detail: "support@operationsavemycgpa.com",
    action: "Send Email",
    href: "mailto:support@operationsavemycgpa.com",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
]

const quickLinks = [
  { title: "Technical Support", description: "Platform issues, login problems, exam difficulties" },
  { title: "Account Questions", description: "Registration, profile updates, account activation" },
  { title: "Course Content", description: "Missing courses, question feedback, content suggestions" },
  { title: "General Inquiries", description: "Platform features, partnerships, collaboration" },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gray-900 rounded-full">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Contact Us</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have a question, suggestion, or need support? We&apos;re here to help you succeed in building your CGPA.
              <span className="text-gray-900 font-medium">
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
                      <div className="p-2 bg-white rounded-lg">
                        <IconComponent className="text-2xl" />
                      </div>
                      {method.title}
                    </CardTitle>
                    <CardDescription className="text-gray-700">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="font-mono text-sm text-gray-900">{method.detail}</p>
                    </div>
                    <Button asChild className={`w-full ${method.buttonColor} text-white`} size="lg">
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
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What can we help you with?</CardTitle>
              <CardDescription className="text-lg">Common topics our support team can assist you with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickLinks.map((link, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Hours & Response Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">* All times are in West Africa Time (WAT)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-gray-600" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp</span>
                  <span className="font-medium text-green-600">Within 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-blue-600">Within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent Issues</span>
                  <span className="font-medium text-red-600">Immediate</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">* Response times may vary during peak periods</p>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="text-center py-8">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Urgent Technical Issues?</h3>
              <p className="text-red-700 mb-4">
                If you&apos;re experiencing critical platform issues during an exam or urgent academic deadline, contact us
                immediately via WhatsApp for priority support.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white" size="lg">
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
