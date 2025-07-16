"use client"

import { useEffect, useState, useCallback } from "react"
import { Trophy, ArrowUpRight, HelpCircle, Medal, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getStudentFromToken } from "@/utils/auth"
import Shepherd from "shepherd.js"
import "shepherd.js/dist/css/shepherd.css"

interface Leader {
  name: string
  totalScore: number
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [userScore, setUserScore] = useState<number>(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [newHighScore, setNewHighScore] = useState(false)
  const [prevTopScore, setPrevTopScore] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [fullLeaders, setFullLeaders] = useState<Leader[]>([])

  const startTour = useCallback(() => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: "shadow-lg bg-white border-slate-200",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: { enabled: true },
      },
      useModalOverlay: true,
    })

    tour.addStep({
      id: "top-scorers",
      text: "This section shows the top 3 scorers in your faculty!",
      attachTo: { element: ".top-scorers-header", on: "bottom" },
      buttons: [
        {
          text: "Next",
          action: tour.next,
          classes: "bg-slate-900 text-white hover:bg-slate-800",
        },
      ],
    })

    tour.addStep({
      id: "leaderboard-entry",
      text: "Each row shows a student's name and total score.",
      attachTo: { element: ".leaderboard-entry", on: "bottom" },
      buttons: [
        {
          text: "Back",
          action: tour.back,
          classes: "border-slate-300 text-slate-700",
        },
        {
          text: "Next",
          action: tour.next,
          classes: "bg-slate-900 text-white hover:bg-slate-800",
        },
      ],
    })

    tour.addStep({
      id: "your-score",
      text: "This is your current score and ranking.",
      attachTo: { element: ".your-score", on: "top" },
      buttons: [
        {
          text: "Back",
          action: tour.back,
          classes: "border-slate-300 text-slate-700",
        },
        {
          text: "Finish",
          action: tour.complete,
          classes: "bg-slate-900 text-white hover:bg-slate-800",
        },
      ],
    })

    tour.start()
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const student = await getStudentFromToken()
      if (!student?.matricNumber) throw new Error("Student not found in token")

      const encodedMatric = encodeURIComponent(student.matricNumber)
      const studentRes = await fetch(`/api/students/${encodedMatric}`)
      if (!studentRes.ok) throw new Error("Failed to fetch student details")

      const studentData = await studentRes.json()
      const facultyId = studentData?.faculty?._id || studentData?.faculty
      if (!facultyId) throw new Error("Faculty ID not found")

      const leaderboardRes = await fetch(`/api/leaderboard?facultyId=${facultyId}`)
      if (!leaderboardRes.ok) throw new Error("Failed to fetch leaderboard")

      const dataRaw = await leaderboardRes.json()
      const data: Leader[] = Array.isArray(dataRaw) ? dataRaw : dataRaw && typeof dataRaw === "object" ? [dataRaw] : []

      const topThree = data.slice(0, 3)
      setLeaders(topThree)

      const currentTopScore = data[0]?.totalScore ?? 0
      if (prevTopScore !== null && currentTopScore > prevTopScore) {
        setNewHighScore(true)
        setTimeout(() => setNewHighScore(false), 5000)
      }
      setPrevTopScore(currentTopScore)

      const resultsRes = await fetch(`/api/results/highestScore/${student.id}`)
      const resultsData = resultsRes.ok ? await resultsRes.json() : null
      const score = resultsData?.highestScore ?? 0
      setUserScore(score)

      setFullLeaders(data.slice(0, 10))
      const userIndex = data.findIndex((entry) => entry.name === student.name)
      setUserRank(userIndex >= 0 ? userIndex + 1 : null)
    } catch (err) {
      console.error("Error loading leaderboard:", err)
      setLeaders([])
      setFullLeaders([])
      setUserScore(0)
      setUserRank(null)
    } finally {
      setLoading(false)
    }
  }, [prevTopScore])

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 100000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-slate-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
      case 1:
        return "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
      case 2:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
      default:
        return "bg-white border-slate-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Scorers Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 top-scorers-header">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Top Performers</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Leading students in your faculty</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={startTour}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Guide
            </Button>
          </div>

          {newHighScore && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <ArrowUpRight className="h-4 w-4" />
              New High Score Achieved!
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : leaders.length > 0 ? (
            <div className="space-y-3">
              {leaders.map((leader, index) => (
                <div
                  key={leader.name}
                  className={cn(
                    "leaderboard-entry flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md",
                    getRankBg(index),
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index) || <span className="text-lg font-bold text-slate-600">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{leader.name}</p>
                      <p className="text-sm text-slate-600">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{leader.totalScore}</p>
                    <p className="text-sm text-slate-600">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No leaderboard data available yet.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <Button onClick={() => setShowModal(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
              View Full Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Performance Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm your-score">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{userScore}</p>
                  <p className="text-sm text-slate-600">Total Points</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{userRank ? `#${userRank}` : "—"}</p>
                  <p className="text-sm text-slate-600">Current Rank</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🎯 <strong>Keep going!</strong> Participate in more exams to improve your ranking and boost your
                academic confidence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Full Leaderboard</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {fullLeaders.length > 0 ? (
                <div className="space-y-2">
                  {fullLeaders.map((leader, index) => (
                    <div
                      key={leader.name}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        index < 3 ? getRankBg(index) : "bg-slate-50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-semibold text-slate-700">{index + 1}</span>
                        <span className="font-medium text-slate-900">{leader.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{leader.totalScore} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No data available</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-center text-sm text-slate-600">
                <p>
                  <strong>Your Position:</strong> {userRank ? `#${userRank}` : "Not ranked yet"}
                </p>
                <p>
                  <strong>Your Score:</strong> {userScore} points
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
