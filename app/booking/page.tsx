"use client"

import { useState } from "react"
import { BookingDateStep } from "@/components/booking/booking-date-step"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Steps } from "@/components/ui/steps"
import { toast } from "@/components/ui/use-toast"
import { checkAvailabilityAction } from "@/actions/calendar-actions"

const steps = [
  { id: "dates", label: "Dates" },
  { id: "guests", label: "Guests" },
  { id: "payment", label: "Payment" },
  { id: "confirmation", label: "Confirmation" }
]

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDateChange = (checkIn: Date | null, checkOut: Date | null) => {
    setCheckIn(checkIn)
    setCheckOut(checkOut)
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate dates before proceeding
      if (!checkIn || !checkOut) {
        toast({
          title: "Error",
          description: "Please select both check-in and check-out dates",
          variant: "destructive"
        })
        return
      }

      setIsSubmitting(true)
      try {
        // Check if the selected dates are available (not booked on VRBO or Airbnb)
        const { isSuccess, data, message } = await checkAvailabilityAction(
          checkIn,
          checkOut
        )

        if (isSuccess && data?.isAvailable) {
          // Dates are available, proceed to next step
          setCurrentStep(currentStep + 1)
        } else {
          toast({
            title: "Dates Unavailable",
            description:
              "Sorry, the selected dates are not available. Please choose different dates.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error checking availability:", error)
        toast({
          title: "Error",
          description: "Failed to check availability. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // For demonstration purposes, just advance to the next step
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Book Your Stay
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Complete the form below to book your dates. Select your preferred
            options and we'll confirm your reservation right away.
          </p>
        </div>

        <div className="mb-8">
          <Steps steps={steps} currentStep={currentStep} />
        </div>

        <Card className="p-6">
          {currentStep === 0 && (
            <BookingDateStep
              checkIn={checkIn}
              checkOut={checkOut}
              onDateChange={handleDateChange}
              onNext={handleNext}
            />
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Guest Details
                </h2>
                <p className="text-muted-foreground text-sm">
                  Please provide your information
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                This is just a demo. In a real application, this would be a form
                to collect guest information.
              </p>
              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button onClick={handleNext}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Payment
                </h2>
                <p className="text-muted-foreground text-sm">
                  Securely complete your payment
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                This is just a demo. In a real application, this would be a
                payment form.
              </p>
              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button onClick={handleNext}>Complete Booking</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Booking Confirmed!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Thank you for your booking
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                This is just a demo. In a real application, this would show
                booking details and confirmation.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
