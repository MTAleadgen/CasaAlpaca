"use server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getPropertyByIdAction } from "@/actions/db/properties-actions"
import { getAvailabilityAction } from "@/actions/calendar-actions"
import { format } from "date-fns"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CalendarTokenGenerator } from "./_components/token-generator"
import { CalendarImport } from "./_components/calendar-import"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Property Calendar | Casa Alpaca Admin",
  description: "Manage property availability and calendar synchronization"
}

interface BookedDate {
  id: string
  start: Date
  end: Date
  summary: string
  source: "vrbo" | "airbnb"
}

export default async function PropertyCalendarPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  return (
    <div className="py-10">
      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <Link href="/admin/property">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Property Calendar
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage availability and calendar synchronization for this property
        </p>
      </div>

      <Suspense fallback={<PropertyCalendarSkeleton />}>
        <PropertyCalendarContent propertyId={searchParams.id} />
      </Suspense>
    </div>
  )
}

async function PropertyCalendarContent({
  propertyId
}: {
  propertyId?: string
}) {
  const { userId } = await auth()

  if (!userId) {
    return <p>Please sign in to access property calendar</p>
  }

  if (!propertyId) {
    return <p>Property ID is required</p>
  }

  const { data: property } = await getPropertyByIdAction(propertyId)

  if (!property) {
    return <p>Property not found</p>
  }

  let bookings: BookedDate[] = []
  let isSuccess = false
  let message = ""

  try {
    // In a real implementation, we would pass the propertyId to get property-specific bookings
    const result = await getAvailabilityAction()
    isSuccess = result.isSuccess
    bookings = result.data || []
    message = result.message
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    message = "Failed to fetch calendar data"
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">
          {property.name} - Calendar Management
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold">Export Calendar</h3>
          <p className="text-muted-foreground mb-4">
            Share this calendar URL with external platforms to publish your
            bookings.
          </p>
          <CalendarTokenGenerator />
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold">
            Import External Calendars
          </h3>
          <p className="text-muted-foreground mb-4">
            Add calendar URLs from Airbnb, VRBO or other booking platforms to
            prevent double bookings.
          </p>
          <CalendarImport />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Integration Status</CardTitle>
            <CardDescription>
              Showing synchronized reservations from external platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 border-b p-4 text-sm font-medium">
                  <div>Platform</div>
                  <div>Check-in</div>
                  <div>Check-out</div>
                  <div>Description</div>
                </div>
                <div className="divide-y">
                  {bookings && bookings.length > 0 ? (
                    bookings.map(booking => (
                      <div
                        key={booking.id}
                        className="grid grid-cols-4 items-center gap-4 p-4 text-sm"
                      >
                        <div className="font-medium capitalize">
                          {booking.source}
                        </div>
                        <div>
                          {format(new Date(booking.start), "MMM dd, yyyy")}
                        </div>
                        <div>
                          {format(new Date(booking.end), "MMM dd, yyyy")}
                        </div>
                        <div>{booking.summary}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground p-4 text-center text-sm">
                      No bookings found in connected calendars
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-red-500">
                Error fetching calendar data: {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PropertyCalendarSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-64" />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>

      <Skeleton className="h-[300px] w-full rounded-md" />
    </div>
  )
}
