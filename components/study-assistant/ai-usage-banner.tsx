"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Crown, Zap, ExternalLink, AlertTriangle } from "lucide-react"
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

interface AIUsageBannerProps {
  onUsageUpdate: (canUse: boolean) => void
}

export function AIUsageBanner({ onUsageUpdate }: AIUsageBannerProps) {
  const [usage, setUsage] = useState<AIUsageData | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
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
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = usage.plan === "premium" ? 100 : (usage.dailyTokensUsed / usage.dailyLimit) * 100

  return (
    <>
      <Card
        className={`mb-4 ${usage.plan === "premium" ? "border-yellow-300 bg-yellow-50" : "border-blue-300 bg-blue-50"}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {usage.plan === "premium" ? (
                <Crown className="h-5 w-5 text-yellow-600" />
              ) : (
                <Zap className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={usage.plan === "premium" ? "default" : "secondary"}>
                    {usage.plan === "premium" ? "Premium" : "Free Plan"}
                  </Badge>
                  {usage.plan === "premium" && usage.premiumExpiryDate && (
                    <span className="text-xs text-gray-600">
                      Until {new Date(usage.premiumExpiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {usage.plan === "premium" ? (
                    "Unlimited AI interactions"
                  ) : (
                    <>
                      {usage.remainingTokens} of {usage.dailyLimit} daily prompts remaining
                    </>
                  )}
                </div>
                {usage.plan === "free" && <Progress value={progressPercentage} className="w-48 h-2 mt-2" />}
              </div>
            </div>

            {usage.plan === "free" && (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>

          {!usage.canUseAI && usage.plan === "free" && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Daily limit reached!</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                You&apos;ve used all 15 free prompts today. Upgrade to Premium for unlimited access or wait until tomorrow.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get unlimited AI interactions and priority support for just ₦{usage.premiumPriceNGN.toLocaleString()} per
              month!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✨ Unlimited AI interactions per day</li>
                <li>🚀 Priority response times</li>
                <li>📚 Advanced study features</li>
                <li>💬 Priority customer support</li>
                <li>🎯 Exclusive study tools</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₦{usage.premiumPriceNGN.toLocaleString()}</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleRequestPremium} className="flex-1 bg-green-600 hover:bg-green-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
