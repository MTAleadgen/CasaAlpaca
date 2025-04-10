import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getAvailabilityAction } from "@/actions/calendar-actions"
import { format } from "date-fns"
import { CalendarImport } from "./_components/calendar-import"
import { CalendarTokenGenerator } from "./token-generator"

export const metadata = {
  title: "Connected Calendars | Admin",
  description: "View connected calendars from Airbnb and VRBO"
}

interface BookedDate {
  id: string
  start: Date
  end: Date
  summary: string
  source: "vrbo" | "airbnb"
}

export default async function ConnectedCalendarsPage() {
  let isSuccess = false
  let bookings: BookedDate[] = []
  let message = ""

  try {
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
        <h2 className="text-2xl font-bold tracking-tight">
          Calendar Synchronization
        </h2>
        <p className="text-muted-foreground">
          Manage two-way calendar synchronization with Airbnb, VRBO, and other
          booking platforms.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold">Export Your Calendar</h3>
          <p className="text-muted-foreground mb-4">
            Share this calendar URL with external platforms to publish your Casa
            Alpaca bookings.
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

      <div className="mt-6 grid gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Calendar sync endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 font-medium">VRBO Calendar</h3>
                <div className="bg-muted overflow-x-auto rounded-md p-2 text-xs">
                  <code>
                    http://www.vrbo.com/icalendar/07407781b20041f1b2962f6d06243216.ics?nonTentative
                  </code>
                </div>
              </div>
              <div>
                <h3 className="mb-1 font-medium">Airbnb Calendar</h3>
                <div className="bg-muted overflow-x-auto rounded-md p-2 text-xs">
                  <code>
                    https://www.airbnb.com/calendar/ical/1317460106754094447.ics?s=78ba39c25491b8875a93837dce1c43a9
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
