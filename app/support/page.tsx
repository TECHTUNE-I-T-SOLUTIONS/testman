"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"

export function useThemeAwareStyles() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return { theme, mounted }
}

import { Heart, Users, Zap, DollarSign, Share2, MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/shared/Navbar"
import { FaWhatsapp, FaDonate } from "react-icons/fa"

const supportWays = [
  {
    icon: DollarSign,
    title: "Make a Donation",
    description: "Support our mission with a one-time donation via bank transfer or mobile money",
    color: "bg-green-50 text-green-600 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  },
  {
    icon: Share2,
    title: "Spread the Word",
    description: "Tell your friends and classmates about Operation Save My CGPA",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  },
  {
    icon: Users,
    title: "Volunteer",
    description: "Contribute content, questions, or help with platform development",
    color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  },
  {
    icon: Heart,
    title: "Social Media",
    description: "Give us a shoutout on your social media platforms",
    color: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700",
  },
]

export default function SupportPage() {
  // For theme responsiveness
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
                <Heart className="h-8 w-8 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Support Our Mission
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
              We&apos;re committed to helping students prepare better, improve their grades, and build stronger CGPAs through
              consistent practice, realistic exam simulations, and academic motivation.
              <span className="text-gray-900 dark:text-white font-medium">
                {" "}
                Your support keeps this mission alive and accessible to everyone.
              </span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1000+</div>
                <p className="text-gray-600 dark:text-gray-200">Students Helped</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
                <p className="text-gray-600 dark:text-gray-200">Courses Available</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <p className="text-gray-600 dark:text-gray-200">Platform Access</p>
              </CardContent>
            </Card>
          </div>

          {/* Ways to Support */}
          <Card className="mb-12 bg-white dark:bg-gray-800 transition-colors duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Ways You Can Support</CardTitle>
              <CardDescription className="text-lg text-gray-700 dark:text-gray-200">
                Every contribution, big or small, makes a difference in a student&apos;s academic journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supportWays.map((way, index) => {
                  const IconComponent = way.icon
                  return (
                    <div key={index} className={`p-6 rounded-lg border-2 ${way.color} transition-colors duration-300`}>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded-lg transition-colors duration-300">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{way.title}</h3>
                          <p className="text-gray-700 dark:text-gray-200 text-sm">{way.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Donation Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FaDonate className="text-gray-600 dark:text-gray-300" />
                  Donation Information
                </CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-200">
                  Your financial support helps us maintain and improve the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-yellow-900 border border-amber-200 dark:border-yellow-700 rounded-lg transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-amber-600 dark:text-yellow-300" />
                    <span className="font-medium text-amber-800 dark:text-yellow-200">Coming Soon</span>
                  </div>
                  <p className="text-amber-700 dark:text-yellow-100 text-sm">
                    <strong>Bank details will be updated soon.</strong>
                    <br />
                    Meanwhile, you can reach out to the admin directly for donation information.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">What your donation supports:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-200 space-y-1">
                    <li>• Server hosting and maintenance</li>
                    <li>• New course content development</li>
                    <li>• Platform improvements and features</li>
                    <li>• Student support services</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* THEME RESPONSIVE CONTACT ADMIN CARD */}
            <Card className="border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <MessageCircle className="text-green-600 dark:text-green-300" />
                  Contact Admin Directly
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Get in touch with our admin for support, donations, or collaboration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-green-800 dark:text-green-100 text-sm">
                  Have questions about supporting us? Want to volunteer or contribute content? Our admin is available to
                  discuss how you can help make a difference.
                </p>
                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:text-white transition-colors duration-300"
                  size="lg"
                >
                  <a
                    href="https://wa.me/2348083191228"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="text-xl" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gray-900 dark:bg-gray-800 text-white transition-colors duration-300">
            <CardContent className="text-center py-12">
              <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
              <p className="text-gray-300 dark:text-gray-200 mb-8 max-w-2xl mx-auto text-lg">
                Together, we can help more students achieve their academic goals and build stronger CGPAs. Every form of
                support counts towards creating a better educational future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-gray-700 hover:text-white dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300">
                  <a href="/contact">Get in Touch</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-gray-800 hover:text-gray-100 bg-transparent dark:border-gray-400 dark:text-white dark:hover:bg-gray-700"
                >
                  <a href="/faq">Learn More</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
