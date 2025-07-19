
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Users, Bell, BellOff, RefreshCw, ChevronLeft, ChevronRight, User, Shield, Calendar, Clock } from "lucide-react"

interface PushSubscription {
  _id: string
  userId: string
  userType: 'student' | 'admin'
  isActive: boolean
  createdAt: string
  lastUsed: string
  endpoint: string
}

const ITEMS_PER_PAGE = 12

export default function ManagePushSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/push/subscriptions?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE))
      } else {
        throw new Error('Failed to fetch subscriptions')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, searchTerm, fetchSubscriptions])

  const handleToggleSubscription = async (subscriptionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/push/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        toast.success(`Subscription ${!isActive ? 'activated' : 'deactivated'}`)
        fetchSubscriptions()
      } else {
        throw new Error('Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.userId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Push Subscriptions</h1>
            <p className="text-muted-foreground">Manage student push notification subscriptions</p>
          </div>
          <Button 
            onClick={fetchSubscriptions} 
            disabled={loading}
            className="border-border bg-background text-foreground hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">All subscriptions</p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {subscriptions.filter(sub => sub.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Receiving notifications</p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Subscriptions</CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <BellOff className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {subscriptions.filter(sub => !sub.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Notifications disabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </p>
        </div>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? "No subscriptions found" : "No subscriptions available"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm 
                  ? "Try adjusting your search criteria or clear the search to see all subscriptions."
                  : "There are currently no push notification subscriptions in the system."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubscriptions.map((subscription) => (
              <Card 
                key={subscription._id} 
                className={`transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-card/80 ${
                  !subscription.isActive ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {subscription.userType === 'student' ? (
                            <User className="h-4 w-4 text-primary" />
                          ) : (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {subscription.userId}
                          </h3>
                          <Badge 
                            variant={subscription.userType === 'student' ? 'default' : 'secondary'}
                            className="text-xs mt-1"
                          >
                            {subscription.userType}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-2">
                      <Badge 
                        variant={subscription.isActive ? 'default' : 'destructive'}
                        className={`${
                          subscription.isActive 
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                        }`}
                      >
                        {subscription.isActive ? (
                          <>
                            <Bell className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <BellOff className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Created: <span className="text-foreground">{formatDate(subscription.createdAt)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Last used: <span className="text-foreground">{getTimeAgo(subscription.lastUsed)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border bg-background text-foreground hover:bg-muted"
                        onClick={() => handleToggleSubscription(subscription._id, subscription.isActive)}
                      >
                        {subscription.isActive ? (
                          <>
                            <BellOff className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Bell className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                ({filteredSubscriptions.length} subscriptions)
              </span>
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="border-border text-foreground hover:bg-muted"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
