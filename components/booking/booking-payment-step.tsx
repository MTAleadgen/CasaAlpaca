"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, ArrowRight, CreditCard, Lock } from "lucide-react"
import { useState } from "react"

interface BookingPaymentStepProps {
  pricing: {
    basePrice: number
    extrasPrice: number
    tax: number
    total: number
  }
  onNext: () => void
  onPrevious: () => void
}

export function BookingPaymentStep({
  pricing,
  onNext,
  onPrevious
}: BookingPaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onNext()
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Payment Information</h2>
        <p className="text-muted-foreground">
          Your payment information is secure and encrypted
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center text-lg font-medium">
                <CreditCard className="mr-2 size-5" />
                Payment Details
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Smith" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingZip">Billing ZIP/Postal Code</Label>
                  <Input id="billingZip" placeholder="90210" />
                </div>
              </div>

              <div className="text-muted-foreground mt-6 flex items-center text-sm">
                <Lock className="mr-2 size-4" />
                <p>Your payment info is secured with 256-bit encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Payment Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accommodation</span>
                  <span>{formatCurrency(pricing.basePrice / 100)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Extras</span>
                  <span>{formatCurrency(pricing.extrasPrice / 100)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>{formatCurrency(pricing.tax / 100)}</span>
                </div>

                <div className="mt-3 border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Payment</span>
                    <span>{formatCurrency(pricing.total / 100)}</span>
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground mt-6 text-sm">
                <p>
                  By proceeding to payment, you agree to our terms and
                  conditions and cancellation policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center"
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 size-4" />
          Previous
        </Button>

        <Button
          onClick={handleSubmit}
          className="flex items-center"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="animate-pulse">Processing...</span>
            </>
          ) : (
            <>
              Complete Booking
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
