"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react"
import { useState } from "react"

interface BookingGuestStepProps {
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
  onGuestsChange: (guests: { adults: number; children: number }) => void
  onGuestInfoChange: (guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }) => void
  onSpecialRequestsChange: (specialRequests: string) => void
  onNext: () => void
  onPrevious: () => void
}

export function BookingGuestStep({
  guests,
  guestInfo,
  specialRequests,
  onGuestsChange,
  onGuestInfoChange,
  onSpecialRequestsChange,
  onNext,
  onPrevious
}: BookingGuestStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateGuestInfo = (field: keyof typeof guestInfo, value: string) => {
    onGuestInfoChange({
      ...guestInfo,
      [field]: value
    })

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const updateGuests = (type: "adults" | "children", value: number) => {
    // Ensure value is between min and max limits
    const minAdults = 1
    const maxGuests = 8

    let newAdults = type === "adults" ? value : guests.adults
    let newChildren = type === "children" ? value : guests.children

    // Enforce minimum of 1 adult
    if (newAdults < minAdults) newAdults = minAdults

    // Enforce total guest maximum
    const totalGuests = newAdults + newChildren
    if (totalGuests > maxGuests) {
      if (type === "adults") {
        newChildren = Math.max(0, maxGuests - newAdults)
      } else {
        newChildren = Math.max(0, maxGuests - newAdults)
      }
    }

    onGuestsChange({
      adults: newAdults,
      children: newChildren
    })
  }

  const handleSubmit = () => {
    // Validate the form
    const newErrors: Record<string, string> = {}

    if (!guestInfo.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!guestInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!guestInfo.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!guestInfo.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
    } else {
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Guest Information</h2>
        <p className="text-muted-foreground">
          Please provide your contact details and the number of guests
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-medium">Number of Guests</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Adults</p>
                <p className="text-muted-foreground text-sm">Age 13+</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateGuests("adults", guests.adults - 1)}
                  disabled={guests.adults <= 1}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-6 text-center">{guests.adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateGuests("adults", guests.adults + 1)}
                  disabled={guests.adults + guests.children >= 8}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Children</p>
                <p className="text-muted-foreground text-sm">Ages 0-12</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateGuests("children", guests.children - 1)}
                  disabled={guests.children <= 0}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-6 text-center">{guests.children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateGuests("children", guests.children + 1)}
                  disabled={guests.adults + guests.children >= 8}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground mt-2 text-sm">
              Maximum {8} guests total
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-medium">Contact Information</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={guestInfo.firstName}
                onChange={e => updateGuestInfo("firstName", e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-destructive text-sm">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={guestInfo.lastName}
                onChange={e => updateGuestInfo("lastName", e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-destructive text-sm">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={e => updateGuestInfo("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={guestInfo.phone}
                onChange={e => updateGuestInfo("phone", e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-destructive text-sm">{errors.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <Textarea
              id="specialRequests"
              placeholder="Let us know if you have any special requests or requirements"
              value={specialRequests}
              onChange={e => onSpecialRequestsChange(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 size-4" />
          Previous
        </Button>

        <Button onClick={handleSubmit} className="flex items-center">
          Continue
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
