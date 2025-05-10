"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStudentFromToken } from "@/utils/auth";

interface Leader {
  name: string;
  totalScore: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newHighScore, setNewHighScore] = useState(false);
  const [prevTopScore, setPrevTopScore] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [fullLeaders, setFullLeaders] = useState<Leader[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const student = await getStudentFromToken();
      if (!student?.matricNumber) throw new Error("Student not found in token");

      const encodedMatric = encodeURIComponent(student.matricNumber);
      const studentRes = await fetch(`/api/students/${encodedMatric}`);
      if (!studentRes.ok) throw new Error("Failed to fetch student details");
      const studentData = await studentRes.json();

      const facultyId = studentData?.faculty?._id || studentData?.faculty;
      if (!facultyId) throw new Error("Faculty ID not found");

      // Fetch leaderboard
      const leaderboardRes = await fetch(`/api/leaderboard?facultyId=${facultyId}`);
      if (!leaderboardRes.ok) throw new Error("Failed to fetch leaderboard");

      const dataRaw = await leaderboardRes.json();
      const data: Leader[] = Array.isArray(dataRaw)
        ? dataRaw
        : dataRaw && typeof dataRaw === "object"
        ? [dataRaw]
        : [];

      const topThree = data.slice(0, 3);
      setLeaders(topThree);

      const currentTopScore = data[0]?.totalScore ?? 0;
      if (prevTopScore !== null && currentTopScore > prevTopScore) {
        setNewHighScore(true);
        setTimeout(() => setNewHighScore(false), 5000);
      }
      setPrevTopScore(currentTopScore);

      // Fetch user's score
      const resultsRes = await fetch(`/api/results/highestScore/${student.id}`);
      const resultsData = resultsRes.ok ? await resultsRes.json() : null;
      const score = resultsData?.highestScore ?? 0;
      setUserScore(score);

      // Full leaderboard for modal
      setFullLeaders(data.slice(0, 10));

      // Calculate user rank
      const userIndex = data.findIndex((entry) => entry.name === student.name);
      setUserRank(userIndex >= 0 ? userIndex + 1 : null);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setLeaders([]);
      setFullLeaders([]);
      setUserScore(0);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  }, [prevTopScore]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <Card className="p-4 shadow-lg rounded-2xl bg-gradient-to-br from-blue-100 to-white animate-fade-in-up overflow-hidden">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="flex justify-center gap-2">
          <Trophy className="text-yellow-500 h-6 w-6 animate-pulse" />
          <h2 className="text-xl font-bold text-blue-800">Top 3 Scorers</h2>
        </div>
        {newHighScore && (
          <div className="flex items-center gap-1 text-sm font-semibold text-green-600 animate-bounce">
            <ArrowUpRight className="w-4 h-4" />
            New High Score!
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
      ) : leaders.length > 0 ? (
        <div className="space-y-3 animate-fade-in">
          {leaders.map((leader, index) => (
            <div
              key={leader.name}
              className={cn(
                "flex justify-between items-center px-4 py-2 rounded-lg bg-white shadow-sm border transition-all",
                index === 0 && "bg-yellow-100 font-bold border-yellow-400",
                index !== 0 && "hover:bg-blue-50"
              )}
            >
              <span>
                {index + 1}. {leader.name}
              </span>
              <span className="text-blue-600 font-medium">
                {leader.totalScore} pts
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          No leaderboard data available.
        </p>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          View Full Leaderboard
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-700">
        <p className="font-semibold">
          Your Score: <span className="text-blue-700">{userScore} pts</span>
        </p>
        <p>Your Rank: {userRank ? `#${userRank}` : "Not ranked yet"}</p>
      </div>

      <div className="mt-4 text-sm text-muted-foreground text-center animate-fade-in">
        🎯 Want to be featured here too? Participate in exams and score high — every point boosts your intelligence and confidence!
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fade-in-up">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4 text-center text-blue-800">
              🏆 Full Leaderboard
            </h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {fullLeaders.length > 0 ? (
                fullLeaders.map((leader, index) => (
                  <li
                    key={leader.name}
                    className={cn(
                      "flex justify-between px-4 py-2 rounded-md",
                      index === 0 && "bg-yellow-100 font-bold",
                      index === 1 && "bg-gray-100",
                      index === 2 && "bg-orange-100"
                    )}
                  >
                    <span>{index + 1}. {leader.name}</span>
                    <span>{leader.totalScore} pts</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500">No data to show.</li>
              )}
            </ul>
            <div className="mt-4 text-sm text-center text-gray-700">
              Your Rank: {userRank ? `#${userRank}` : "Not ranked yet"} <br />
              Your Score: {userScore} pts
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
