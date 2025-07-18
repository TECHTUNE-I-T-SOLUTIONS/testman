"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  FileText,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Trophy,
  Sparkles,
  ArrowRight,
  X,
  Zap,
  Target,
  Clock,
} from "lucide-react"

const features = [
  {
    icon: MessageCircle,
    title: "Free Chat Mode",
    description: "Ask Alex AI anything about your studies",
    color: "from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/60",
    textColor: "text-blue-700 dark:text-blue-200",
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Get key points from your materials instantly",
    color: "from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/60",
    textColor: "text-purple-700 dark:text-purple-200",
  },
  {
    icon: Lightbulb,
    title: "Concept Explainer",
    description: "Break down complex topics step-by-step",
    color: "from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/60",
    textColor: "text-orange-700 dark:text-orange-200",
  },
  {
    icon: Trophy,
    title: "Practice Exams",
    description: "Generate CBT-style exams from your notes",
    color: "from-green-500 to-green-600 dark:from-green-400 dark:to-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/60",
    textColor: "text-green-700 dark:text-green-200",
  },
]

const stats = [
  { label: "Students Helped", value: "10,000+", icon: Target },
  { label: "Questions Generated", value: "50,000+", icon: FileText },
  { label: "Study Hours Saved", value: "25,000+", icon: Clock },
]

export function AIFeaturesBanner() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  const currentFeatureData = features[currentFeature]
  const CurrentIcon = currentFeatureData.icon

  return (
    <div className="relative overflow-hidden">
      <Card className="mx-4 mt-4 lg:mx-auto lg:max-w-7xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white shadow-2xl dark:bg-gradient-to-r dark:from-blue-900 dark:via-purple-900 dark:to-green-900 dark:text-white">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/60" />
        <div className="relative p-6 lg:p-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 dark:text-white/90 dark:hover:bg-white/20"
          >
            <X className="h-4 w-4 text-white dark:text-white" />
          </Button>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Feature Showcase */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm">
                  <Brain className="h-8 w-8 text-white dark:text-white" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white dark:text-white">Meet Alex AI</h2>
                  <p className="text-white/90 dark:text-white/90">Your Personal Study Assistant</p>
                </div>
                <Badge className="ml-auto bg-yellow-500 text-yellow-900 hover:bg-yellow-400 dark:bg-yellow-400 dark:text-yellow-900 dark:hover:bg-yellow-300">
                  <Sparkles className="h-3 w-3 mr-1 text-yellow-900 dark:text-yellow-900" />
                  NEW
                </Badge>
              </div>

              {/* Animated Feature Display */}
              <div
                className={`transition-all duration-500 transform ${
                  hasAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <div
                  className={`p-4 rounded-xl ${currentFeatureData.bgColor} bg-opacity-20 dark:bg-opacity-40 backdrop-blur-sm border border-white/20 dark:border-white/30`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 bg-gradient-to-r ${currentFeatureData.color} rounded-lg`}>
                      <CurrentIcon className="h-5 w-5 text-white dark:text-white" />
                    </div>
                    <h3 className={`text-xl font-semibold ${currentFeatureData.textColor}`}>{currentFeatureData.title}</h3>
                  </div>
                  <p className="text-white/90 dark:text-white">{currentFeatureData.description}</p>
                </div>
              </div>

              {/* Feature Indicators */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentFeature
                        ? "bg-white w-6 dark:bg-yellow-400"
                        : "bg-white/50 dark:bg-white/30"
                    }`}
                    aria-label={`Show feature ${index + 1}`}
                  />
                ))}
              </div>

              {/* Quick Features Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                {features.map((feature, index) => {
                  const FeatureIcon = feature.icon
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/30 transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 cursor-pointer ${
                        index === currentFeature ? "ring-2 ring-white/50 dark:ring-yellow-400/60" : ""
                      }`}
                      onClick={() => setCurrentFeature(index)}
                    >
                      <FeatureIcon className="h-5 w-5 text-white dark:text-yellow-400 mb-2" />
                      <p className="text-sm font-medium text-white/90 dark:text-white">{feature.title}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats & CTA */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white dark:text-yellow-400">
                  <Zap className="h-5 w-5 text-white dark:text-yellow-400" />
                  Impact Stats
                </h3>
                <div className="space-y-3">
                  {stats.map((stat, index) => {
                    const StatIcon = stat.icon
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 ${
                          hasAnimated ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <StatIcon className="h-5 w-5 text-white/80 dark:text-yellow-400" />
                        <div>
                          <div className="text-lg font-bold text-white dark:text-yellow-400">{stat.value}</div>
                          <div className="text-sm text-white/80 dark:text-white/80">{stat.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-white dark:text-yellow-400">
                  <BookOpen className="h-4 w-4 text-white dark:text-yellow-400" />
                  What You Can Do:
                </h4>
                <ul className="space-y-2 text-sm text-white/90 dark:text-white">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-white dark:text-yellow-400" />
                    Upload PDFs, images, or text files
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-white dark:text-yellow-400" />
                    Generate practice questions instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-white dark:text-yellow-400" />
                    Get detailed explanations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-white dark:text-yellow-400" />
                    Create study summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-white dark:text-yellow-400" />
                    Take AI-generated practice exams
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-white/10 dark:bg-yellow-900/20 backdrop-blur-sm rounded-lg border border-white/20 dark:border-yellow-400/40">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-400 dark:text-yellow-400" />
                  <span className="font-semibold text-yellow-400 dark:text-yellow-300">Operation Save My CGPA</span>
                </div>
                <p className="text-sm text-white/90 dark:text-white">
                  Join thousands of students already improving their grades with Alex AI!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 dark:bg-yellow-400/10 rounded-full animate-pulse" />
          <div
            className="absolute top-1/2 -left-8 w-16 h-16 bg-white/5 dark:bg-yellow-400/10 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-4 right-1/3 w-12 h-12 bg-white/5 dark:bg-yellow-400/10 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </Card>
    </div>
  )
}
