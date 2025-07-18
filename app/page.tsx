"use client"

import { useState, useEffect } from "react"
import type { FC } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import CountUp from "react-countup"
import { useInView } from "react-intersection-observer"

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
  MessageCircle,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStudentFromToken } from "@/utils/auth"
import EvidenceVideos from "@/components/EvidenceVideos"
import CookieNotice from "@/components/CookieNotice"
import { useTheme } from "@/contexts/ThemeContext"

const Page: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true })
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute logoSrc based on theme and mounted
  const logoSrc = mounted
    ? theme === "dark"
      ? "/ChatGPT Image Jul 17, 2025, 08_31_35 AM.png"
      : "/Operation-save-my-CGPA-07.svg"
    : "/ChatGPT Image Jul 17, 2025, 08_31_35 AM.png";

  // Check if user is logged in (this would be replaced with your actual auth logic)
  useEffect(() => {
    const getToken = async () => {
      const token = await getStudentFromToken()
      getStudentFromToken()
      setIsLoggedIn(!!token)
    }
    getToken()
  }, [])

  interface Particle {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
  }
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

  // Helper for dark mode classes
  const darkBg = "dark:bg-[#18181b]"
  const darkCard = "dark:bg-[#23232a] dark:border-[#23232a]"
  const darkText = "dark:text-gray-100"
  const darkMutedText = "dark:text-gray-400"
  const darkBadge = "dark:bg-[#23232a] dark:text-primary"
  const darkBorder = "dark:border-[#23232a]"
  const darkSection = "dark:bg-[#18181b]"
  const darkGradient = "dark:bg-gradient-to-b dark:from-[#18181b] dark:to-[#23232a]"
  const darkFooter = "dark:bg-[#23232a]"
  const darkFooterText = "dark:text-gray-300"
  const darkFooterMuted = "dark:text-gray-400"
  const darkFooterBorder = "dark:border-[#23232a]"
  const darkButtonOutline = "dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground"
  const darkButtonSecondary = "dark:bg-[#23232a] dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground"
  const darkButton = "dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
  const darkBadgeSecondary = "dark:bg-[#23232a] dark:text-primary"
  const darkCardContent = "dark:bg-[#23232a]"

  return (
    <div className={`min-h-screen flex flex-col ${darkBg}`}>
      {/* Navbar */}
      <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${darkBorder} ${darkBg}`}>
        <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              {mounted && (
                <Image
                  key={theme}
                  src={logoSrc}
                  alt="Operation Save My CGPA Logo"
                  width={30}
                  height={30}
                  className="h-15 w-15"
                />
              )}
              <span className={`text-xl font-bold tracking-tight ${darkText}`}>Operation Save My CGPA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className={`text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors ${darkText} dark:hover:text-primary`}
              >
                Features
              </Link>
              <Link
                href="#about"
                className={`text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors ${darkText} dark:hover:text-primary`}
              >
                About
              </Link>
              <Link
                href="#faculties"
                className={`text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors ${darkText} dark:hover:text-primary`}
              >
                Faculties
              </Link>
              <Link
                href="#testimonials"
                className={`text-sm font-medium hover:text-primary hover:text-gray-600 transition-colors ${darkText} dark:hover:text-primary`}
              >
                Testimonials
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {isLoggedIn ? (
                <Button asChild className={darkButton}>
                  <Link href="/student">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className={darkButtonOutline}>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild className={darkButton}>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${darkButtonOutline}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t ${darkBorder} ${darkBg}`}>
              <div className="py-4 space-y-4">
                <nav className="flex flex-col space-y-3">
                  <Link
                    href="#features"
                    className={`flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors ${darkText} dark:hover:text-primary`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#about"
                    className={`flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors ${darkText} dark:hover:text-primary`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#faculties"
                    className={`flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors ${darkText} dark:hover:text-primary`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Faculties
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#testimonials"
                    className={`flex items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors ${darkText} dark:hover:text-primary`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </nav>
                <div className={`pt-2 border-t flex flex-col gap-2 ${darkBorder}`}>
                  {isLoggedIn ? (
                    <Button className={`w-full ${darkButton}`} asChild>
                      <Link href="/student">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className={`w-full bg-transparent ${darkButtonOutline}`} asChild>
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button className={`w-full ${darkButton}`} asChild>
                        <Link href="/auth/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className={`relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-6 md:py-6 ${darkGradient}`}>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                className={`text-center space-y-6 ${darkText}`}
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
                    {mounted && (
                      <Image
                        key={theme}
                        src={logoSrc}
                        alt="Operation Save My CGPA Logo"
                        width={40}
                        height={40}
                        className="h-32 w-32 text-primary transition-transform duration-300"
                      />
                    )}
                  </motion.div>
                  <Badge className={`px-3 py-1 text-lg ${darkBadgeSecondary}`} variant="secondary">
                    University of Ilorin & Beyond
                  </Badge>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${darkText}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Boost Your Academic Performance
                </motion.h1>

                {/* Description */}
                <motion.p
                  className={`text-xl text-muted-foreground ${darkMutedText}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Daily learning, quizzes, and resources designed to help you excel in your studies and save your CGPA.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 pt-4 justify-center items-center relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button size="lg" asChild className={`relative z-10 ${darkButton}`}>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                  <span className={`text-gray-500 ${darkMutedText}`}>or</span>
                  <Button size="lg" variant="outline" asChild className={`relative z-10 ${darkButtonOutline}`}>
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
                  <div className={`text-sm text-muted-foreground ${darkMutedText}`}>
                    <span className={`font-medium text-foreground ${darkText}`}>{inView && <CountUp end={200} duration={2} />}+</span>{" "}
                    students already improving their grades
                  </div>
                </motion.div>
              </motion.div>

              <div className={`relative lg:h-[600px] rounded-lg overflow-hidden border shadow-xl ${darkCard}`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-100 to-background dark:from-primary/20 dark:via-[#23232a] dark:to-[#18181b]`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-6 p-8">
                    <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600 dark:text-blue-300">
                      <BookOpen className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Daily Learning Materials</span>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-green-600 dark:text-green-300">
                      <FileText className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Interactive Quizzes</span>
                    </div>
                    <div className="bg-amber-100 dark:bg-yellow-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-amber-600 dark:text-yellow-300">
                      <GraduationCap className="h-16 w-16 mb-3" />
                      <span className="font-medium text-center">Exam Preparation</span>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300">
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
        <section className={`py-12 bg-muted/30 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8" ref={ref}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {/* Active Students */}
              <div className={`flex flex-col items-center text-center p-4 ${darkCard}`}>
                <Users className="h-8 w-8 text-primary mb-2" />
                <div className={`text-3xl font-bold ${darkText}`}>{inView && <CountUp end={100} duration={2} />}+</div>
                <p className={`text-sm text-muted-foreground ${darkMutedText}`}>Active Students</p>
              </div>
              {/* Courses Covered */}
              <div className={`flex flex-col items-center text-center p-4 ${darkCard}`}>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <div className={`text-3xl font-bold ${darkText}`}>{inView && <CountUp end={30} duration={2} />}+</div>
                <p className={`text-sm text-muted-foreground ${darkMutedText}`}>Courses Covered</p>
              </div>
              {/* Grade Improvement */}
              <div className={`flex flex-col items-center text-center p-4 ${darkCard}`}>
                <Award className="h-8 w-8 text-primary mb-2" />
                <div className={`text-3xl font-bold ${darkText}`}>{inView && <CountUp end={85} duration={2} />}%</div>
                <p className={`text-sm text-muted-foreground ${darkMutedText}`}>Grade Improvement</p>
              </div>
              {/* Quizzes Completed */}
              <div className={`flex flex-col items-center text-center p-4 ${darkCard}`}>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <div className={`text-3xl font-bold ${darkText}`}>{inView && <CountUp end={500} duration={2.5} />}+</div>
                <p className={`text-sm text-muted-foreground ${darkMutedText}`}>Quizzes Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-20 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 ${darkText}`}>
              <Badge className={`mb-4 ${darkBadge}`}>Features</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>Everything You Need to Excel</h2>
              <p className={`text-lg text-muted-foreground ${darkMutedText}`}>
                Our comprehensive suite of tools and resources designed to help you succeed in your academic journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className={`overflow-hidden border border-muted transition-all hover:shadow-md ${darkCard}`}>
                  <CardContent className={`p-6 flex flex-col items-center text-center ${darkCardContent}`}>
                    <div className="rounded-full bg-primary/10 dark:bg-primary/20 w-16 h-16 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkText}`}>{feature.title}</h3>
                    <p className={`text-muted-foreground ${darkMutedText}`}>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={`py-20 bg-muted/30 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600 dark:text-blue-300 h-60">
                    <BookOpen className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Learn Anywhere</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-green-600 dark:text-green-300 h-60">
                    <Users className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Study Together</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-yellow-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-amber-600 dark:text-yellow-300 h-60">
                    <Award className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Achieve Excellence</span>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300 h-60">
                    <Brain className="h-20 w-20 mb-4" />
                    <span className="font-medium text-lg text-center">Expand Knowledge</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className={`text-center lg:text-left ${darkText}`}>
                  <Badge className={darkBadge}>About Us</Badge>
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${darkText}`}>
                    Our Mission is to Improve Academic Performance
                  </h2>
                  <p className={`text-lg text-muted-foreground ${darkMutedText}`}>
                    Operation Save My CGPA was created by students who understand the challenges of university
                    education. We&apos;re dedicated to providing tools that make learning more effective, engaging, and
                    accessible.
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 dark:bg-primary/20 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkText}`}>Daily Learning</h3>
                      <p className={`text-muted-foreground ${darkMutedText}`}>
                        Consistent, bite-sized learning to build strong foundations.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 dark:bg-primary/20 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkText}`}>Personalized Experience</h3>
                      <p className={`text-muted-foreground ${darkMutedText}`}>
                        Content tailored to your specific courses and learning style.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-2 rounded-full bg-primary/10 dark:bg-primary/20 p-2 h-fit">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkText}`}>Community Support</h3>
                      <p className={`text-muted-foreground ${darkMutedText}`}>
                        Connect with peers and mentors for collaborative learning.
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`text-center lg:text-left`}>
                  <Button size="lg" className={`mt-4 ${darkButton}`} asChild>
                    <Link href="/about">Learn More About Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faculties Section */}
        <section id="faculties" className={`py-20 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 ${darkText}`}>
              <Badge className={`mb-4 ${darkBadge}`}>Faculties</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>
                Supporting All Academic Disciplines
              </h2>
              <p className={`text-lg text-muted-foreground ${darkMutedText}`}>
                Our platform covers all faculties at the University of Ilorin and beyond, ensuring every student has
                access to relevant resources.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {faculties.map((faculty, index) => (
                <Badge key={index} variant="secondary" className={`text-sm py-2 px-4 ${darkBadgeSecondary}`}>
                  {faculty}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={`py-20 bg-muted/30 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 ${darkText}`}>
              <Badge className={`mb-4 ${darkBadge}`}>How It Works</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>Simple Steps to Academic Success</h2>
              <p className={`text-lg text-muted-foreground ${darkMutedText}`}>
                Getting started with Operation Save My CGPA is easy. Follow these simple steps to begin your journey to
                better grades.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className={`flex flex-col items-center text-center ${darkCard}`}>
                <div className="rounded-full bg-primary/10 dark:bg-primary/20 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkText}`}>Create Your Account</h3>
                <p className={`text-muted-foreground ${darkMutedText}`}>
                  Sign up and create your profile with your faculty and department.
                </p>
              </div>
              <div className={`flex flex-col items-center text-center ${darkCard}`}>
                <div className="rounded-full bg-primary/10 dark:bg-primary/20 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkText}`}>Select Your Courses</h3>
                <p className={`text-muted-foreground ${darkMutedText}`}>
                  Choose the courses you&apos;re currently taking to personalize your experience.
                </p>
              </div>
              <div className={`flex flex-col items-center text-center ${darkCard}`}>
                <div className="rounded-full bg-primary/10 dark:bg-primary/20 w-16 h-16 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkText}`}>Start Learning</h3>
                <p className={`text-muted-foreground ${darkMutedText}`}>
                  Access daily materials, take quizzes, and track your progress as you improve.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" asChild className={darkButton}>
                <Link href="/auth/signup">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/*Guide Section*/}
        <section id="Evidence" className={`py-20 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center mx-auto mb-16 ${darkText}`}>
              <Badge className={`mb-4 ${darkBadge}`}>Short Guides</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>A peek into our Platform</h2>
              <p className={`text-lg text-muted-foreground ${darkMutedText}`}>A guide into our platform</p>
              <EvidenceVideos />
            </div>
          </div>
        </section>

        {/* AI Features Spotlight */}
        <section className={`py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-[#23232a] dark:via-[#18181b] dark:to-[#23232a]`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center max-w-4xl mx-auto mb-16 ${darkText}`}>
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">🚀 Latest Update</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>
                Introducing Alex AI Study Assistant
              </h2>
              <p className={`text-lg text-muted-foreground mb-8 ${darkMutedText}`}>
                Experience the power of artificial intelligence in your academic journey with our revolutionary AI study companion.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* AI Features List */}
              <div className="space-y-6">
                <div className={`flex items-start gap-4 p-4 bg-white/70 dark:bg-[#23232a]/80 backdrop-blur-sm rounded-xl border border-purple-100 dark:border-purple-900`}>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2`}>Intelligent Study Materials Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Upload your notes, PDFs, and documents. Alex AI analyzes and creates personalized study content just for you.</p>
                  </div>
                </div>

                <div className={`flex items-start gap-4 p-4 bg-white/70 dark:bg-[#23232a]/80 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-blue-900`}>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2`}>AI-Generated Practice Exams</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Get custom practice tests generated from your own study materials with instant feedback and explanations.</p>
                  </div>
                </div>

                <div className={`flex items-start gap-4 p-4 bg-white/70 dark:bg-[#23232a]/80 backdrop-blur-sm rounded-xl border border-green-100 dark:border-green-900`}>
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2`}>24/7 AI Study Chat</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Ask questions, get explanations, and receive study guidance anytime. Alex AI is always ready to help.</p>
                  </div>
                </div>

                <div className={`flex items-start gap-4 p-4 bg-white/70 dark:bg-[#23232a]/80 backdrop-blur-sm rounded-xl border border-amber-100 dark:border-yellow-900`}>
                  <div className="p-2 bg-amber-100 dark:bg-yellow-900 rounded-lg">
                    <BookMarked className="h-6 w-6 text-amber-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2`}>Smart Summaries & Key Points</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Transform lengthy materials into concise, focused summaries that highlight the most important concepts.</p>
                  </div>
                </div>
              </div>

              {/* Visual Demo */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-[#23232a] dark:to-[#18181b] rounded-2xl p-8 border border-purple-200 dark:border-purple-900">
                  <div className="bg-white dark:bg-[#23232a] rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Alex AI Assistant</h4>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">Online</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-100 dark:bg-[#18181b] rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          &quot;Can you help me understand photosynthesis for my Biology exam?&quot;
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-3">
                        <p className="text-sm">
                          &quot;I&apos;d be happy to help! Based on your uploaded materials, here&apos;s a simplified explanation with practice questions...&quot;
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className={`text-xs ${darkButtonOutline}`}>
                          <FileText className="h-3 w-3 mr-1" />
                          Generate Quiz
                        </Button>
                        <Button size="sm" variant="outline" className={`text-xs ${darkButtonOutline}`}>
                          <BookMarked className="h-3 w-3 mr-1" />
                          Create Summary
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-bounce"></div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white dark:from-purple-700 dark:to-blue-700">
                <Link href="/auth/signup">Try Alex AI Now</Link>
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                Available in the Exams section after registration
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={`py-20 ${darkSection}`}>
          <div className="w-full max-w-none px-4 lg:px-6 xl:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 ${darkText}`}>
              <Badge className={`mb-4 ${darkBadge}`}>Testimonials</Badge>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>What Our Students Say</h2>
              <p className={`text-lg text-muted-foreground ${darkMutedText}`}>
                Hear from students who have transformed their academic performance with Operation Save My CGPA.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className={`overflow-hidden border border-muted transition-all hover:shadow-md ${darkCard}`}>
                  <CardContent className={`p-6 ${darkCardContent}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`rounded-full p-2 ${
                          index === 0
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                            : index === 1
                              ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300"
                              : "bg-amber-100 dark:bg-yellow-900/40 text-amber-600 dark:text-yellow-300"
                        }`}
                      >
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkText}`}>{testimonial.name}</h3>
                        <p className={`text-sm text-muted-foreground ${darkMutedText}`}>{testimonial.department}</p>
                      </div>
                    </div>
                    <p className={`italic text-muted-foreground ${darkMutedText}`}>&quot;{testimonial.content}&quot;</p>
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
          className={`relative py-20 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-primary-foreground overflow-hidden mx-4 lg:mx-6 xl:mx-8 rounded-lg shadow-xl ${darkGradient}`}
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
              className={`text-center max-w-3xl mx-auto ${darkText}`}
            >
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${darkText}`}>
                Ready to Boost Your Academic Performance?
              </h2>
              <p className={`text-xl opacity-90 mb-8 ${darkMutedText}`}>
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
                  className={`hover:scale-110 hover:shadow-xl transition-transform duration-300 ${darkButtonSecondary}`}
                  asChild
                >
                  <Link href="/auth/signup">Sign Up Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`bg-transparent border-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-110 hover:shadow-xl transition-transform duration-300 ${darkButtonOutline}`}
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
      <footer className={`py-12 bg-muted ${darkFooter}`}>
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
                <span className={`text-xl font-bold ${darkFooterText}`}>Operation Save My CGPA</span>
              </div>
              <p className={`text-center md:text-left text-muted-foreground ${darkFooterMuted}`}>
                Empowering students to achieve academic excellence through daily learning and comprehensive resources.
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${darkFooterText}`}>Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#about" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#faculties" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Faculties
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${darkFooterText}`}>Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${darkFooterText}`}>Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between bg-amber-100 dark:bg-[#23232a] rounded-lg items-center p-4 ${darkFooterBorder}`}>
            <p className={`text-sm md:text-md text-muted-foreground ${darkFooterMuted}`}>
              © {new Date().getFullYear()} Operation Save My CGPA. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
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
              <Link href="#" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
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
              <Link href="#" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
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
              <Link href="#" className={`text-muted-foreground hover:text-primary transition-colors ${darkFooterMuted} dark:hover:text-primary`}>
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