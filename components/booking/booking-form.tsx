"use client"

import { useState } from "react"
import { BookingDateStep } from "@/components/booking/booking-date-step"
import { BookingExtrasStep } from "@/components/booking/booking-extras-step"
import { BookingGuestStep } from "@/components/booking/booking-guest-step"
import { BookingPaymentStep } from "@/components/booking/booking-payment-step"
import { BookingSummaryStep } from "@/components/booking/booking-summary-step"
import { Card, CardContent } from "@/components/ui/card"
import { SelectExtra } from "@/db/schema"

// Define step types
type BookingStep = "dates" | "extras" | "guests" | "payment" | "summary"

export default function BookingForm() {
  // Current step state
  const [step, setStep] = useState<BookingStep>("dates")

  // Form data state
  const [bookingData, setBookingData] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    selectedExtras: [] as SelectExtra[],
    guests: {
      adults: 2,
      children: 0
    },
    guestInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    },
    specialRequests: ""
  })

  // Mock pricing calculation
  const calculatePrice = () => {
    // Base price calculation (just as a placeholder)
    const basePrice =
      bookingData.checkIn && bookingData.checkOut
        ? getDaysBetween(bookingData.checkIn, bookingData.checkOut) * 19900 // $199 per night in cents
        : 0

    // Calculate extras price
    const extrasPrice = bookingData.selectedExtras.reduce(
      (sum, extra) => sum + extra.price,
      0
    )

    // Calculate tax
    const subtotal = basePrice + extrasPrice
    const tax = Math.round(subtotal * 0.07) // 7% tax

    // Calculate total
    const total = subtotal + tax

    return {
      basePrice,
      extrasPrice,
      tax,
      total
    }
  }

  // Helper to calculate days between dates
  const getDaysBetween = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Navigation handlers
  const goToNextStep = () => {
    switch (step) {
      case "dates":
        setStep("extras")
        break
      case "extras":
        setStep("guests")
        break
      case "guests":
        setStep("payment")
        break
      case "payment":
        setStep("summary")
        break
      default:
        break
    }
  }

  const goToPreviousStep = () => {
    switch (step) {
      case "extras":
        setStep("dates")
        break
      case "guests":
        setStep("extras")
        break
      case "payment":
        setStep("guests")
        break
      case "summary":
        setStep("payment")
        break
      default:
        break
    }
  }

  // Step components
  const renderStep = () => {
    switch (step) {
      case "dates":
        return (
          <BookingDateStep
            checkIn={bookingData.checkIn}
            checkOut={bookingData.checkOut}
            onDateChange={(checkIn, checkOut) =>
              setBookingData(prev => ({ ...prev, checkIn, checkOut }))
            }
            onNext={goToNextStep}
          />
        )
      case "extras":
        return (
          <BookingExtrasStep
            initialExtras={bookingData.selectedExtras}
            onNext={selectedExtras => {
              setBookingData(prev => ({ ...prev, selectedExtras }))
              goToNextStep()
            }}
            onPrevious={goToPreviousStep}
          />
        )
      case "guests":
        return (
          <BookingGuestStep
            guests={bookingData.guests}
            guestInfo={bookingData.guestInfo}
            specialRequests={bookingData.specialRequests}
            onGuestsChange={guests =>
              setBookingData(prev => ({ ...prev, guests }))
            }
            onGuestInfoChange={guestInfo =>
              setBookingData(prev => ({ ...prev, guestInfo }))
            }
            onSpecialRequestsChange={specialRequests =>
              setBookingData(prev => ({ ...prev, specialRequests }))
            }
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "payment":
        return (
          <BookingPaymentStep
            pricing={calculatePrice()}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "summary":
        return (
          <BookingSummaryStep
            bookingData={bookingData}
            pricing={calculatePrice()}
            onEditBooking={() => setStep("dates")}
          />
        )
    }
  }

  return (
    <Card>
      <CardContent className="px-4 py-6 sm:px-6">
        {/* Booking progress indicator */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between">
            {["dates", "extras", "guests", "payment", "summary"].map(s => (
              <div
                key={s}
                className={`flex-1 text-center text-sm font-medium ${
                  s === step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            ))}
          </div>

          <div className="bg-muted relative h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary absolute h-full transition-all duration-300"
              style={{
                width:
                  step === "dates"
                    ? "20%"
                    : step === "extras"
                      ? "40%"
                      : step === "guests"
                        ? "60%"
                        : step === "payment"
                          ? "80%"
                          : "100%"
              }}
            />
          </div>
        </div>

        {/* Current step */}
        {renderStep()}
      </CardContent>
    </Card>
  )
}
