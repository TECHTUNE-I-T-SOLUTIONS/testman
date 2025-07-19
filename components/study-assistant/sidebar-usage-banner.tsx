"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Crown, Zap, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface AIUsageData {
  canUseAI: boolean
  plan: "free" | "premium"
  dailyTokensUsed: number
  remainingTokens: number | "unlimited"
  totalTokensUsed: number
  premiumExpiryDate?: string
  premiumPriceNGN: number
  dailyLimit: number
}

interface SidebarUsageBannerProps {
  onUsageUpdate: (canUse: boolean) => void
}

export function SidebarUsageBanner({ onUsageUpdate }: SidebarUsageBannerProps) {
  const [usage, setUsage] = useState<AIUsageData | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
    
    // Listen for custom event to show upgrade modal from chat interface
    const handleShowUpgradeModal = () => {
      setShowUpgradeModal(true)
    }
    
    window.addEventListener('showUpgradeModal', handleShowUpgradeModal)
    
    return () => {
      window.removeEventListener('showUpgradeModal', handleShowUpgradeModal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/ai/check-usage")
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
        onUsageUpdate(data.canUseAI)
      }
    } catch (error) {
      console.error("Error fetching usage:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPremium = async () => {
    try {
      const response = await fetch("/api/ai/request-premium", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.whatsappUrl, "_blank")
        toast.success("Premium request sent! Check WhatsApp to complete your request.")
        setShowUpgradeModal(false)
      } else {
        toast.error("Failed to create premium request")
      }
    } catch (error) {
      console.error("Error requesting premium:", error)
      toast.error("Error creating premium request")
    }
  }

  if (loading || !usage) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const progressPercentage =
    usage.plan === "premium" ? 100 : (usage.dailyTokensUsed / usage.dailyLimit) * 100

  return (
    <>
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {usage.plan === "premium" ? (
          // Premium user display
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-yellow-700 dark:text-yellow-200">Premium</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Unlimited</div>
            </div>
          </div>
        ) : (
          // Free user display
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Free Plan</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {usage.remainingTokens}/{usage.dailyLimit}
              </Badge>
            </div>
            
            <Progress
              value={progressPercentage}
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
            />
            
            {!usage.canUseAI && (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full h-7 text-xs bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-yellow-200">
              <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-200">
              Get unlimited AI interactions for just ₦2,500 per month!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/40 dark:border-yellow-700">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-100 space-y-1">
                <li>✨ Unlimited AI interactions per day</li>
                <li>🚀 Priority response times</li>
                <li>📚 Advanced study features</li>
                <li>💬 Priority customer support</li>
                <li>🎯 Exclusive study tools</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                ₦2,500
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-200">per month</div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="flex-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Try Again Tomorrow
            </Button>
            <Button
              onClick={handleRequestPremium}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 dark:text-gray-900"
            >
              <ExternalLink className="h-4 w-4 mr-2 text-white dark:text-gray-900" />
              Contact Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 