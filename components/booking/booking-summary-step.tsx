"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SelectExtra } from "@/db/schema"
import { formatCurrency } from "@/lib/utils"
import { Check, Edit, Home, Mail, Phone, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface BookingSummaryStepProps {
  bookingData: {
    checkIn: Date | null
    checkOut: Date | null
    selectedExtras: SelectExtra[]
    guests: {
      adults: number
      children: number
    }
    guestInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    specialRequests: string
  }
  pricing: {
    basePrice: number
    extrasPrice: number
    tax: number
    total: number
  }
  onEditBooking: () => void
}

export function BookingSummaryStep({
  bookingData,
  pricing,
  onEditBooking
}: BookingSummaryStepProps) {
  // Calculate number of nights
  const nights =
    bookingData.checkIn && bookingData.checkOut
      ? Math.ceil(
          (bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  // Generate a mock confirmation code
  const confirmationCode =
    "CA" +
    Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

  return (
    <div className="space-y-8">
      <div className="bg-primary/10 rounded-lg p-6 text-center">
        <div className="bg-primary/20 mb-4 inline-flex size-12 items-center justify-center rounded-full">
          <Check className="text-primary size-6" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Booking Confirmed!</h2>
        <div className="mb-4 flex justify-center">
          <Image
            src="/images/6974955a-8165-45c3-9791-90fd02133fdd.png"
            alt="Our Logo"
            width={120}
            height={30}
            className="h-auto object-contain"
          />
        </div>
        <p className="text-muted-foreground mb-2">
          Your reservation has been confirmed. A confirmation email has been
          sent to {bookingData.guestInfo.email}.
        </p>
        <p className="font-medium">
          Confirmation Code:{" "}
          <span className="text-primary">{confirmationCode}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="flex items-center text-lg font-medium">
                  <Home className="mr-2 size-5" />
                  Stay Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-sm"
                  onClick={onEditBooking}
                >
                  <Edit className="mr-1 size-3" />
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Check-in</p>
                  <p className="font-medium">
                    {bookingData.checkIn
                      ? format(bookingData.checkIn, "EEEE, MMMM d, yyyy")
                      : ""}
                  </p>
                  <p className="text-sm">After 3:00 PM</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    Check-out
                  </p>
                  <p className="font-medium">
                    {bookingData.checkOut
                      ? format(bookingData.checkOut, "EEEE, MMMM d, yyyy")
                      : ""}
                  </p>
                  <p className="text-sm">Before 11:00 AM</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground mb-2 text-sm">Guests</p>
                <p>
                  {bookingData.guests.adults}{" "}
                  {bookingData.guests.adults === 1 ? "adult" : "adults"}
                  {bookingData.guests.children > 0 && (
                    <>
                      , {bookingData.guests.children}{" "}
                      {bookingData.guests.children === 1 ? "child" : "children"}
                    </>
                  )}
                </p>
              </div>

              {bookingData.specialRequests && (
                <div className="mt-6">
                  <p className="text-muted-foreground mb-2 text-sm">
                    Special Requests
                  </p>
                  <p className="bg-muted/50 rounded-md p-3 text-sm">
                    {bookingData.specialRequests}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {bookingData.selectedExtras.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">Selected Extras</h3>

                <div className="space-y-4">
                  {bookingData.selectedExtras.map(extra => (
                    <div key={extra.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{extra.name}</p>
                        {extra.description && (
                          <p className="text-muted-foreground text-sm">
                            {extra.description}
                          </p>
                        )}
                      </div>
                      <p>{formatCurrency(extra.price / 100)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center text-lg font-medium">
                <User className="mr-2 size-5" />
                Contact Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="text-muted-foreground mr-2 size-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Name</p>
                    <p>
                      {bookingData.guestInfo.firstName}{" "}
                      {bookingData.guestInfo.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="text-muted-foreground mr-2 size-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p>{bookingData.guestInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="text-muted-foreground mr-2 size-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Phone</p>
                    <p>{bookingData.guestInfo.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Payment Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-muted-foreground">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatCurrency(pricing.basePrice / nights / 100)} ×{" "}
                      {nights}
                    </p>
                  </div>
                  <p>{formatCurrency(pricing.basePrice / 100)}</p>
                </div>

                {pricing.extrasPrice > 0 && (
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Selected extras</p>
                    <p>{formatCurrency(pricing.extrasPrice / 100)}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <p className="text-muted-foreground">Taxes & fees</p>
                  <p>{formatCurrency(pricing.tax / 100)}</p>
                </div>

                <div className="mt-3 border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <p>Total</p>
                    <p>{formatCurrency(pricing.total / 100)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground mb-2 text-sm">
                  Cancellation Policy
                </p>
                <p className="text-sm">
                  Free cancellation up to 7 days before check-in. Cancellations
                  after this period or no-shows will be charged the full amount.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Link href="/">
              <Button className="w-full">Return to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
