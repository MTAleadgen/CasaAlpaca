"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

interface BookingDateStepProps {
  checkIn: Date | null
  checkOut: Date | null
  onDateChange: (checkIn: Date | null, checkOut: Date | null) => void
  onNext: () => void
}

export function BookingDateStep({
  checkIn,
  checkOut,
  onDateChange,
  onNext
}: BookingDateStepProps) {
  const [dateSelection, setDateSelection] = useState<"checkIn" | "checkOut">(
    "checkIn"
  )

  // Mock unavailable dates as an example
  const disabledDates = [
    new Date(2023, 7, 10),
    new Date(2023, 7, 11),
    new Date(2023, 7, 15),
    new Date(2023, 7, 16),
    new Date(2023, 7, 17)
  ]

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (dateSelection === "checkIn") {
        onDateChange(date, null)
        setDateSelection("checkOut")
      } else {
        // Make sure checkout is after checkin
        if (checkIn && date < checkIn) {
          onDateChange(date, checkIn)
        } else {
          onDateChange(checkIn, date)
        }
      }
    }
  }

  const isDateSelectionValid = () => {
    return checkIn && checkOut
  }

  // Calculate nights and basic price (just as a placeholder)
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0

  const basePrice = nights * 19900 // $199 per night in cents

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Select Your Dates</h2>
        <p className="text-muted-foreground">
          Choose your check-in and check-out dates to check availability
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <Card
              className={`flex-1 cursor-pointer ${dateSelection === "checkIn" ? "border-primary" : ""}`}
              onClick={() => setDateSelection("checkIn")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-lg">
                      {checkIn ? format(checkIn, "MMM d, yyyy") : "Select date"}
                    </p>
                  </div>
                  <CalendarIcon className="text-muted-foreground size-5" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`flex-1 cursor-pointer ${dateSelection === "checkOut" ? "border-primary" : ""}`}
              onClick={() => setDateSelection("checkOut")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-lg">
                      {checkOut
                        ? format(checkOut, "MMM d, yyyy")
                        : "Select date"}
                    </p>
                  </div>
                  <CalendarIcon className="text-muted-foreground size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Calendar
            mode="single"
            selected={
              dateSelection === "checkIn"
                ? checkIn || undefined
                : checkOut || undefined
            }
            onSelect={handleDateSelect}
            disabled={[
              { before: new Date() }, // Can't select dates in the past
              ...disabledDates
            ]}
            className="rounded-md border p-3"
          />
        </div>

        <div>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="mb-4 text-lg font-medium">Booking Summary</h3>

            {isDateSelectionValid() ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-muted-foreground">
                      {format(checkIn!, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Check-out</p>
                    <p className="text-muted-foreground">
                      {format(checkOut!, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span>
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(basePrice / 100)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Base price before taxes and additional fees
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Select both check-in and check-out dates to see a summary of
                your booking
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isDateSelectionValid()}
          className="flex items-center"
        >
          Continue
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
