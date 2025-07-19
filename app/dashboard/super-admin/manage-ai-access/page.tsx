"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  Search, 
  Crown, 
  Users, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  RefreshCw, 
  Mail, 
  GraduationCap, 
  Building,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  UserCheck,
  BookOpen
} from "lucide-react"

interface AIUser {
  _id: string
  studentId: {
    _id: string
    name: string
    matricNumber: string
    email: string
    faculty?: { _id: string; name: string }
    department?: { _id: string; name: string }
    level?: { _id: string; name: string }
  }
  plan: "free" | "premium"
  dailyTokensUsed: number
  totalTokensUsed: number
  premiumExpiryDate?: string
  lastResetDate: string
  createdAt: string
}

const ITEMS_PER_PAGE = 12

export default function ManageAIAccess() {
  const [users, setUsers] = useState<AIUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<AIUser | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage AI Access</h1>
          <p className="text-muted-foreground">Monitor and manage student AI usage and subscriptions</p>
        </div>
        <Button onClick={fetchAIUsers} disabled={loading} className="border-border bg-background text-black dark:text-white dark:bg-gray-800 hover:bg-muted">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Free Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.freeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.premiumUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTokensUsed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, matric number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48 border-border bg-background">
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} AI users
        </p>
        {(searchTerm || planFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setPlanFilter("all")
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Users Cards Grid */}
      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading AI users...</span>
          </CardContent>
        </Card>
      ) : paginatedUsers.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || planFilter !== "all" ? "No users found" : "No AI users available"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || planFilter !== "all"
                ? "Try adjusting your search criteria or clear the filters to see all users."
                : "There are currently no AI users registered in the system."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedUsers.map((user) => (
            <Card 
              key={user._id} 
              className={`transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-card/80 ${
                isPremiumExpired(user) ? 'opacity-75' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user.studentId.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {user.studentId.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.studentId.matricNumber}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={user.plan === "premium" ? "default" : "secondary"}
                    className={user.plan === "premium" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800" : ""}
                  >
                    {user.plan === "premium" ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      "Free"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{user.studentId.email}</span>
                </div>

                {/* Faculty */}
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {user.studentId.faculty?.name || "N/A"}
                  </span>
                </div>

                {/* Department */}
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {user.studentId.department?.name || "N/A"}
                  </span>
                </div>

                {/* Level */}
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {user.studentId.level?.name || "N/A"}
                  </span>
                </div>

                {/* Daily Usage */}
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Daily: <span className="font-medium text-foreground">{user.dailyTokensUsed}</span>
                    {user.plan === "free" && <span className="text-muted-foreground">/15</span>}
                  </span>
                </div>

                {/* Total Tokens */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{user.totalTokensUsed.toLocaleString()}</span>
                  </span>
                </div>

                {/* Last Active */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Last: {formatDate(user.lastResetDate)}
                  </span>
                </div>

                {/* Premium Expiry */}
                {user.plan === "premium" && user.premiumExpiryDate && (
                  <div className="pt-2">
                    <Badge 
                      variant="outline" 
                      className={`${
                        isPremiumExpired(user) 
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                          : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                      }`}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      {isPremiumExpired(user) ? "Expired" : `Until ${formatDate(user.premiumExpiryDate)}`}
                    </Badge>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {user.plan === "free" && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUpgradeModal(true)
                      }}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade to Premium
                    </Button>
                  )}
                  {user.plan === "premium" && isPremiumExpired(user) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUpgradeModal(true)
                      }}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Renew Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="border-border text-foreground hover:bg-muted"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredUsers.length} users)
            </span>
          </div>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="border-border text-foreground hover:bg-muted"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedUser && (
                <>
                  Upgrade <strong className="text-foreground">{selectedUser.studentId.name}</strong> ({selectedUser.studentId.matricNumber}) to
                  Premium access?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Unlimited AI interactions per day</li>
                <li>• Priority support</li>
                <li>• Advanced features access</li>
                <li>• Valid for 30 days from activation</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeModal(false)}
              className="border-border text-foreground hover:bg-muted"
            >
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
