"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import {
  getPricingRuleAction,
  updatePricingRuleAction
} from "@/actions/db/pricing-adapters"

interface BaseRatesFormProps {
  propertyId: string
  existingRules: any | null
}

export function BaseRatesForm({
  propertyId,
  existingRules
}: BaseRatesFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [weekdayRate, setWeekdayRate] = useState(0)
  const [weekendRate, setWeekendRate] = useState(0)

  // Fetch pricing rules on mount
  useEffect(() => {
    async function fetchPricingRules() {
      try {
        const { isSuccess, data } = await getPricingRuleAction(propertyId)

        if (isSuccess && data) {
          // Convert from cents to dollars for display
          setWeekdayRate(data.baseWeekdayRate / 100)
          setWeekendRate(data.baseWeekendRate / 100)
        } else {
          // Set default values if no rules exist
          setWeekdayRate(100)
          setWeekendRate(150)
        }
      } catch (error) {
        console.error("Error fetching pricing rules:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing rules",
          variant: "destructive"
        })

        // Fall back to defaults
        setWeekdayRate(100)
        setWeekendRate(150)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricingRules()
  }, [propertyId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert from dollars to cents for storage
      const weekdayRateCents = Math.round(weekdayRate * 100)
      const weekendRateCents = Math.round(weekendRate * 100)

      const { isSuccess, message } = await updatePricingRuleAction(propertyId, {
        baseWeekdayRate: weekdayRateCents,
        baseWeekendRate: weekendRateCents
      })

      if (isSuccess) {
        toast({
          title: "Base rates updated",
          description: message
        })
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating pricing rules:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center pt-6">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekday-rate">Weekday Rate (per night)</Label>
              <div className="relative">
                <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                  $
                </span>
                <Input
                  id="weekday-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weekdayRate}
                  onChange={e =>
                    setWeekdayRate(parseFloat(e.target.value) || 0)
                  }
                  className="pl-7"
                  placeholder="100.00"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Standard rate for Monday through Thursday
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekend-rate">Weekend Rate (per night)</Label>
              <div className="relative">
                <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                  $
                </span>
                <Input
                  id="weekend-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weekendRate}
                  onChange={e =>
                    setWeekendRate(parseFloat(e.target.value) || 0)
                  }
                  className="pl-7"
                  placeholder="150.00"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Standard rate for Friday, Saturday, and Sunday
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Base Rates"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
