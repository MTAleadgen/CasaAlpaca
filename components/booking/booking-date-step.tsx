"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react"
import { format, differenceInDays, isSameDay } from "date-fns"
import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { getAvailabilityAction } from "@/actions/calendar-actions"
import { toast } from "@/components/ui/use-toast"

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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [disabledDates, setDisabledDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch booked dates from both VRBO and Airbnb
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true)
      try {
        const { isSuccess, data, message } = await getAvailabilityAction()

        if (isSuccess && data) {
          // Create an array of disabled dates from all bookings
          const bookedDates: Date[] = []

          data.forEach(booking => {
            const start = new Date(booking.start)
            const end = new Date(booking.end)

            // Add all dates between start and end (inclusive of start, exclusive of end)
            let currentDate = new Date(start)
            while (currentDate < end) {
              bookedDates.push(new Date(currentDate))
              currentDate.setDate(currentDate.getDate() + 1)
            }
          })

          setDisabledDates(bookedDates)
        } else {
          toast({
            title: "Error",
            description: message || "Failed to load availability data",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [])

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      onDateChange(range.from, range.to || null)
    } else {
      onDateChange(null, null)
    }
  }

  // Custom modifiers for the calendar
  const modifiers = {
    disabled: [{ before: today }, ...disabledDates]
  }

  // Custom modifiers styles
  const modifiersStyles = {
    disabled: {
      textDecoration: "line-through",
      color: "gray"
    }
  }

  const numberOfNights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0

  const basePrice = 100 // Price per night in dollars
  const totalPrice = numberOfNights * basePrice

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Select your dates
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose your check-in and check-out dates
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <Calendar
          mode="range"
          selected={{
            from: checkIn || undefined,
            to: checkOut || undefined
          }}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={modifiers.disabled}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className={cn(
            "w-full [&_.rdp-caption]:text-lg [&_.rdp-multiple_months]:space-x-4",
            "[&_.rdp-day]:size-10 [&_.rdp-day]:text-sm",
            "[&_.rdp-button:hover]:bg-accent [&_.rdp-button:focus]:bg-accent",
            "[&_.rdp-nav_button]:size-8",
            isLoading ? "pointer-events-none opacity-50" : ""
          )}
          footer={
            isLoading ? (
              <div className="text-muted-foreground py-2 text-center text-sm">
                Loading availability...
              </div>
            ) : undefined
          }
        />
      </div>

      {numberOfNights > 0 && (
        <p className="text-muted-foreground text-sm">
          Selected stay: {numberOfNights} night{numberOfNights === 1 ? "" : "s"}
        </p>
      )}

      <Button
        onClick={onNext}
        disabled={!checkIn || !checkOut || isLoading}
        className="w-full"
      >
        Continue to Guest Details
      </Button>
    </div>
  )
}
