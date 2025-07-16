"use client"

import { useState, useEffect } from "react"
import type { FC } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import CountUp from "react-countup"
import { useInView } from "react-intersection-observer"

// Add import for User icon
import {
  BookOpen,
  GraduationCap,
  BarChart2,
  Award,
  Users,
  CheckCircle,
  Menu,
  X,
  ChevronRight,
  FileText,
  BookMarked,
  Brain,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStudentFromToken } from "@/utils/auth"
import EvidenceVideos from "@/components/EvidenceVideos"
import CookieNotice from "@/components/CookieNotice"

const Page: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true })

  type Particle = {
    x: number
    y: number
    radius: number
    speedX: number
    speedY: number
  }

  // Check if user is logged in (this would be replaced with your actual auth logic)
  useEffect(() => {
    // Example: Check localStorage or session for auth token
    const getToken = async () => {
      const token = await getStudentFromToken()
      getStudentFromToken()
      setIsLoggedIn(!!token)
    }
    getToken()
  }, [])

  useEffect(() => {
    const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement
    if (canvas) {
      const ctx = canvas.getContext("2d")
      let particles: Particle[] = []

      const createParticles = () => {
        particles = Array.from({ length: 30 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedX: Math.random() - 0.5,
          speedY: Math.random() - 0.5,
        }))
      }

      const animate = () => {
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const p of particles) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.3)"
          ctx.fill()
          p.x += p.speedX
          p.y += p.speedY
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
        }
        requestAnimationFrame(animate)
      }

      canvas.width = window.innerWidth
      canvas.height = 400
      createParticles()
      animate()
    }
  }, [])

  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Daily Learning",
      description: "Access structured daily learning materials tailored to your courses and curriculum.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Course Quizzes",
      description: "Test your knowledge with quizzes designed to reinforce concepts from your lectures.",
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: "Exam Preparation",
      description: "Comprehensive exam prep with past questions and timed practice tests.",
    },
    {
      icon: <BookMarked className="h-10 w-10 text-primary" />,
      title: "Academic Resources",
      description: "Access textbooks, lecture notes, and supplementary materials for all courses.",
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your academic progress and identify areas for improvement.",
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Study Groups",
      description: "Connect with peers for collaborative learning and knowledge sharing.",
    },
  ]

  const testimonials = [
    {
      name: "Aisha Ibrahim",
      department: "Computer Science",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "Operation Save My CGPA helped me improve from a 3.2 to a 4.1 GPA in just one semester. The daily quizzes really reinforced my learning!",
    },
    {
      name: "Oluwaseun Adeyemi",
      department: "Mechanical Engineering",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "The exam preparation resources are incredible. I've never felt more confident going into my finals. This app is a game-changer!",
    },
    {
      name: "Chioma Okafor",
      department: "Medicine & Surgery",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "As a medical student with a heavy course load, this app helps me stay organized and on top of my studies. The structured approach works wonders.",
    },
  ]

  const faculties = [
    "Arts",
    "Agriculture",
    "Basic Medical Sciences",
    "Clinical Sciences",
    "Communication & Information Sciences",
    "Education",
    "Engineering & Technology",
    "Environmental Sciences",
    "Law",
    "Life Sciences",
    "Management Sciences",
    "Pharmaceutical Sciences",
    "Physical Sciences",
    "Social Sciences",
    "Veterinary Medicine",
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/Operation-save-my-CGPA-07.svg"
                alt="Operation Save My CGPA Logo"
                width={30}
                height={30}
                className="h-15 w-15"
              />
              <span className="text-xl font-bold tracking-tight">Operation Save My CGPA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="#faculties"
                className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
              >
                Faculties
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors"
              >
                Testimonials
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
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t">
              <div className="py-4 space-y-4">
                <nav className="flex flex-col space-y-3">
                  <Link
                    href="#features"
                    className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#about"
                    className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#faculties"
                    className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Faculties
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#testimonials"
                    className="flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
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
                      <Button variant="outline" className="w-full bg-transparent" asChild>
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-6 md:py-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                ref={ref}
              >
                {/* Icon + Badge */}
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.6 }}>
                    <Image
                      src="/Operation-save-my-CGPA-07.svg"
                      alt="Operation Save My CGPA Logo"
                      width={40}
                      height={40}
                      className="h-32 w-32 text-primary transition-transform duration-300"
                    />
                  </motion.div>
                  <Badge className="px-3 py-1 text-lg" variant="secondary">
                    University of Ilorin & Beyond
                  </Badge>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Boost Your Academic Performance
                </motion.h1>

                {/* Description */}
                <motion.p
                  className="text-xl text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Daily learning, quizzes, and resources designed to help you excel in your studies and save your CGPA.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 pt-4 justify-center items-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button size="lg" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                  or
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </motion.div>

                {/* Avatar Group + Counter */}
                <motion.div
                  className="flex items-center gap-4 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{inView && <CountUp end={200} duration={2} />}+</span>{" "}
                    students already improving their grades
                  </div>
                </motion.div>
              </motion.div>

              <div className="relative lg:h-[600px] rounded-lg overflow-hidden border shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-100 to-background"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-6 p-8">
                    <div className="bg-blue-100 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600">
                      <BookOpen className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Daily Learning Materials</span>
                    </div>
                    <div className="bg-green-100 rounded-xl p-6 flex flex-col items-center justify-center text-green-600">
                      <FileText className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Interactive Quizzes</span>
                    </div>
                    <div className="bg-amber-100 rounded-xl p-6 flex flex-col items-center justify-center text-amber-600">
                      <GraduationCap className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Exam Preparation</span>
                    </div>
                    <div className="bg-purple-100 rounded-xl p-6 flex flex-col items-center justify-center text-purple-600">
                      <BarChart2 className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Progress Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/30">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8" ref={ref}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {/* Active Students */}
              <div className="flex flex-col items-center text-center p-4">
                <Users className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{inView && <CountUp end={100} duration={2} />}+</div>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
              {/* Courses Covered */}
              <div className="flex flex-col items-center text-center p-4">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{inView && <CountUp end={30} duration={2} />}+</div>
                <p className="text-sm text-muted-foreground">Courses Covered</p>
              </div>
              {/* Grade Improvement */}
              <div className="flex flex-col items-center text-center p-4">
                <Award className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{inView && <CountUp end={85} duration={2} />}%</div>
                <p className="text-sm text-muted-foreground">Grade Improvement</p>
              </div>
              {/* Quizzes Completed */}
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold">{inView && <CountUp end={500} duration={2.5} />}+</div>
                <p className="text-sm text-muted-foreground">Quizzes Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything You Need to Excel</h2>
              <p className="text-lg text-muted-foreground">
                Our comprehensive suite of tools and resources designed to help you succeed in your academic journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="overflow-hidden border border-muted transition-all hover:shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600 h-60">
                    <BookOpen className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Learn Anywhere</span>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 flex flex-col items-center justify-center text-green-600 h-60">
                    <Users className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Study Together</span>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-6 flex flex-col items-center justify-center text-amber-600 h-60">
                    <Award className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Achieve Excellence</span>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 flex flex-col items-center justify-center text-purple-600 h-60">
                    <Brain className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Expand Knowledge</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <Badge>About Us</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Our Mission is to Improve Academic Performance
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Operation Save My CGPA was created by students who understand the challenges of university
                    education. We&apos;re dedicated to providing tools that make learning more effective, engaging, and
                    accessible.
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Daily Learning</h3>
                      <p className="text-muted-foreground">
                        Consistent, bite-sized learning to build strong foundations.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personalized Experience</h3>
                      <p className="text-muted-foreground">
                        Content tailored to your specific courses and learning style.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community Support</h3>
                      <p className="text-muted-foreground">
                        Connect with peers and mentors for collaborative learning.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <Button size="lg" className="mt-4" asChild>
                    <Link href="/about">Learn More About Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faculties Section */}
        <section id="faculties" className="py-20">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4">Faculties</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Supporting All Academic Disciplines
              </h2>
              <p className="text-lg text-muted-foreground">
                Our platform covers all faculties at the University of Ilorin and beyond, ensuring every student has
                access to relevant resources.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {faculties.map((faculty, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                  {faculty}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4">How It Works</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple Steps to Academic Success</h2>
              <p className="text-lg text-muted-foreground">
                Getting started with Operation Save My CGPA is easy. Follow these simple steps to begin your journey to
                better grades.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up and create your profile with your faculty and department.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select Your Courses</h3>
                <p className="text-muted-foreground">
                  Choose the courses you&apos;re currently taking to personalize your experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
                <p className="text-muted-foreground">
                  Access daily materials, take quizzes, and track your progress as you improve.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/*Guide Section*/}
        <section id="Evidence" className="py-20">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="text-center mx-auto mb-16">
              <Badge className="mb-4">Short Guides</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A peek into our Platform</h2>
              <p className="text-lg text-muted-foreground">A guide into our platform</p>
              <EvidenceVideos />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What Our Students Say</h2>
              <p className="text-lg text-muted-foreground">
                Hear from students who have transformed their academic performance with Operation Save My CGPA.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="overflow-hidden border border-muted transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`rounded-full p-2 ${
                          index === 0
                            ? "bg-blue-100 text-blue-600"
                            : index === 1
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.department}</p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground">&quot;{testimonial.content}&quot;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative py-20 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-primary-foreground overflow-hidden mx-4 lg:mx-6 xl:mx-8 rounded-lg shadow-xl"
        >
          {/* Floating particles */}
          <canvas id="particle-canvas" className="absolute top-0 left-0 w-full h-full z-0" />
          {/* Animated background shapes */}
          <div className="absolute w-40 h-40 bg-pink-500 opacity-20 rounded-full -top-10 -left-10 animate-pulse blur-2xl z-0" />
          <div className="absolute w-32 h-32 bg-blue-400 opacity-20 rounded-full -bottom-10 right-10 animate-ping blur-xl z-0" />

          <div className="relative z-10 w-full max-w-none px-4 lg:px-6 xl:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to Boost Your Academic Performance?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of students who are already improving their grades with Operation Save My CGPA.
              </p>
              {/* Buttons with hover effects */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="hover:scale-110 hover:shadow-xl transition-transform duration-300"
                  asChild
                >
                  <Link href="/auth/signup">Sign Up Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-110 hover:shadow-xl transition-transform duration-300"
                  asChild
                >
                  <Link href="/auth/login">Log in</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex justify-center md:justify-start items-center gap-2">
                <Image
                  src="/Operation-save-my-CGPA-07.svg"
                  alt="Operation Save My CGPA Logo"
                  width={30}
                  height={30}
                  className="h-15 w-15 text-primary"
                />
                <span className="text-xl font-bold">Operation Save My CGPA</span>
              </div>
              <p className="text-center md:text-left text-muted-foreground">
                Empowering students to achieve academic excellence through daily learning and comprehensive resources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#faculties" className="text-muted-foreground hover:text-primary transition-colors">
                    Faculties
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between bg-amber-100 rounded-lg items-center p-4">
            <p className="text-sm md:text-md text-muted-foreground">
              © {new Date().getFullYear()} Operation Save My CGPA. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <CookieNotice />
        </div>
      </footer>
    </div>
  )
}

export default Page
