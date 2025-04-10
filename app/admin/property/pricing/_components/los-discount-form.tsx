"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { InfoIcon, Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  getPricingRulesAction,
  updatePricingRuleAction
} from "@/actions/db/pricing-actions"
import { SelectPricingRule } from "@/db/schema"

interface LosDiscountFormProps {
  propertyId: string
  existingRules: SelectPricingRule | null
}

export function LosDiscountForm({
  propertyId,
  existingRules
}: LosDiscountFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [losDiscountThreshold, setLosDiscountThreshold] = useState(3)
  const [losDiscountAmount, setLosDiscountAmount] = useState(0)

  // Load existing rules from database
  useEffect(() => {
    async function fetchPricingRules() {
      try {
        const { isSuccess, data } = await getPricingRulesAction(propertyId)

        if (isSuccess && data) {
          // Convert from cents to dollars for display
          setLosDiscountThreshold(data.losDiscountThreshold || 3)
          setLosDiscountAmount(
            data.losDiscountAmount ? data.losDiscountAmount / 100 : 0
          )
        }
      } catch (error) {
        console.error("Error fetching pricing rules:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing rules",
          variant: "destructive"
        })
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
      // Convert amount from dollars to cents for storage
      const losDiscountAmountCents = Math.round(losDiscountAmount * 100)

      const { isSuccess, message } = await updatePricingRuleAction(propertyId, {
        propertyId,
        losDiscountThreshold,
        losDiscountAmount: losDiscountAmountCents
      })

      if (isSuccess) {
        toast({
          title: "Discount settings updated",
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
              <div className="flex items-center">
                <Label htmlFor="los-threshold" className="mr-2">
                  Minimum Stay Length
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="text-muted-foreground size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimum nights required to qualify for discount</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="los-threshold"
                type="number"
                min="1"
                step="1"
                value={losDiscountThreshold}
                onChange={e =>
                  setLosDiscountThreshold(parseInt(e.target.value) || 3)
                }
                placeholder="3"
              />
              <p className="text-muted-foreground text-xs">
                Guests must stay this many nights to receive the discount
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="los-discount" className="mr-2">
                  Discount Amount
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="text-muted-foreground size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Flat rate discount for qualifying stays</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                  $
                </span>
                <Input
                  id="los-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={losDiscountAmount}
                  onChange={e =>
                    setLosDiscountAmount(parseFloat(e.target.value) || 0)
                  }
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Flat rate discount for stays of {losDiscountThreshold} nights or
                more
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-md p-4">
            <h3 className="text-md mb-2 font-medium">
              Length of Stay Discount
            </h3>
            <p className="text-muted-foreground mb-2 text-sm">
              Guests who stay for {losDiscountThreshold} nights or more will
              receive:
            </p>
            <p className="text-primary text-xl font-bold">
              ${losDiscountAmount.toFixed(2)} off
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Discount Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
