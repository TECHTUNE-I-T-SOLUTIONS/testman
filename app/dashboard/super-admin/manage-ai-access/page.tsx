"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, Crown, Users, Calendar, TrendingUp, Loader2, RefreshCw } from "lucide-react"

interface AIUser {
  _id: string
  studentId: {
    _id: string
    name: string
    matricNumber: string
    email: string
    faculty?: { name: string }
    department?: { name: string }
  }
  plan: "free" | "premium"
  dailyTokensUsed: number
  totalTokensUsed: number
  premiumExpiryDate?: string
  lastResetDate: string
  createdAt: string
}

export default function ManageAIAccess() {
  const [users, setUsers] = useState<AIUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<AIUser | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalTokensUsed: 0,
  })

  useEffect(() => {
    fetchAIUsers()
  }, [])

  const fetchAIUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/ai-users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setStats(data.stats)
      } else {
        toast.error("Failed to fetch AI users")
      }
    } catch (error) {
      console.error("Error fetching AI users:", error)
      toast.error("Error fetching AI users")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeToPremium = async () => {
    if (!selectedUser) return

    try {
      setUpgrading(true)
      const response = await fetch("/api/admin/ai-users/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedUser.studentId._id,
          plan: "premium",
        }),
      })

      if (response.ok) {
        toast.success(`${selectedUser.studentId.name} upgraded to Premium successfully!`)
        setShowUpgradeModal(false)
        setSelectedUser(null)
        fetchAIUsers() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to upgrade user")
      }
    } catch (error) {
      console.error("Error upgrading user:", error)
      toast.error("Error upgrading user")
    } finally {
      setUpgrading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlan = planFilter === "all" || user.plan === planFilter

    return matchesSearch && matchesPlan
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isPremiumExpired = (user: AIUser) => {
    if (user.plan !== "premium" || !user.premiumExpiryDate) return false
    return new Date() > new Date(user.premiumExpiryDate)
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage AI Access</h1>
          <p className="text-muted-foreground">Monitor and manage student AI usage and subscriptions</p>
        </div>
        <Button onClick={fetchAIUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Free Users</p>
                <p className="text-2xl font-bold">{stats.freeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Users</p>
                <p className="text-2xl font-bold">{stats.premiumUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokensUsed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, matric number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free Plan</SelectItem>
                <SelectItem value="premium">Premium Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>AI Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage student AI access and usage</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading AI users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || planFilter !== "all" ? "No users match your filters" : "No AI users found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Daily Usage</th>
                    <th className="text-left p-2">Total Tokens</th>
                    <th className="text-left p-2">Last Active</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{user.studentId.name}</p>
                          <p className="text-sm text-gray-500">{user.studentId.matricNumber}</p>
                          <p className="text-xs text-gray-400">{user.studentId.email}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.plan === "premium" ? "default" : "secondary"}>
                            {user.plan === "premium" ? (
                              <>
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </>
                            ) : (
                              "Free"
                            )}
                          </Badge>
                          {user.plan === "premium" && user.premiumExpiryDate && (
                            <span className={`text-xs ${isPremiumExpired(user) ? "text-red-600" : "text-green-600"}`}>
                              {isPremiumExpired(user) ? "Expired" : `Until ${formatDate(user.premiumExpiryDate)}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <span className="font-medium">{user.dailyTokensUsed}</span>
                          {user.plan === "free" && <span className="text-gray-500">/15</span>}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{user.totalTokensUsed.toLocaleString()}</span>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-500">{formatDate(user.lastResetDate)}</span>
                      </td>
                      <td className="p-2">
                        {user.plan === "free" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUpgradeModal(true)
                            }}
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        )}
                        {user.plan === "premium" && isPremiumExpired(user) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUpgradeModal(true)
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Renew
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Upgrade <strong>{selectedUser.studentId.name}</strong> ({selectedUser.studentId.matricNumber}) to
                  Premium access?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Unlimited AI interactions per day</li>
                <li>• Priority support</li>
                <li>• Advanced features access</li>
                <li>• Valid for 30 days from activation</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeToPremium} disabled={upgrading}>
              {upgrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
