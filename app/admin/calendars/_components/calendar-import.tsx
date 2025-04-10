"use client"

import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  addExternalCalendarAction,
  removeExternalCalendarAction
} from "@/actions/calendar-actions"

interface CalendarSource {
  id: string
  name: string
  url: string
  platform: "airbnb" | "vrbo" | "other"
}

export function CalendarImport() {
  const { toast } = useToast()
  const [calendarUrl, setCalendarUrl] = useState("")
  const [platform, setPlatform] = useState<"airbnb" | "vrbo" | "other">(
    "airbnb"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sources, setSources] = useState<CalendarSource[]>([
    // Example data - in a real app this would come from a server action
    {
      id: "1",
      name: "Airbnb Calendar",
      url: "https://airbnb.com/calendar/ical/123456.ics",
      platform: "airbnb"
    }
  ])

  const handleAddCalendar = async () => {
    if (!calendarUrl) {
      toast({
        title: "Error",
        description: "Please enter a calendar URL",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real implementation, we would call the server action
      // const result = await addExternalCalendarAction({ url: calendarUrl, platform })

      // For demo purposes, directly update the state
      const newSource: CalendarSource = {
        id: Date.now().toString(),
        name:
          platform === "airbnb"
            ? "Airbnb Calendar"
            : platform === "vrbo"
              ? "VRBO Calendar"
              : "External Calendar",
        url: calendarUrl,
        platform
      }

      setSources([...sources, newSource])
      setCalendarUrl("")

      toast({
        title: "Calendar added",
        description: "External calendar has been successfully imported"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add calendar",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveCalendar = async (id: string) => {
    try {
      // In a real implementation, we would call the server action
      // await removeExternalCalendarAction(id)

      // For demo purposes, directly update the state
      setSources(sources.filter(source => source.id !== id))

      toast({
        title: "Calendar removed",
        description: "External calendar has been removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove calendar",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import External Calendars</CardTitle>
        <CardDescription>
          Add iCal links from booking platforms to prevent double bookings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={platform}
              onValueChange={(value: "airbnb" | "vrbo" | "other") =>
                setPlatform(value)
              }
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="vrbo">VRBO/HomeAway</SelectItem>
                <SelectItem value="other">Other Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="calendar-url">Calendar URL (iCal)</Label>
            <div className="flex gap-2">
              <Input
                id="calendar-url"
                placeholder="https://www.airbnb.com/calendar/ical/..."
                value={calendarUrl}
                onChange={e => setCalendarUrl(e.target.value)}
              />
              <Button onClick={handleAddCalendar} disabled={isSubmitting}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 font-medium">Connected Calendars</h4>
          {sources.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No external calendars connected
            </p>
          ) : (
            <div className="space-y-2">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-muted-foreground max-w-xs truncate text-xs">
                      {source.url}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCalendar(source.id)}
                    aria-label="Remove calendar"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <div className="text-muted-foreground text-sm">
          <h4 className="mb-1 font-medium">How to find your calendar URL</h4>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <span className="font-medium">Airbnb:</span> Go to Calendar
              Settings &gt; Export Calendar &gt; Copy Link Address
            </li>
            <li>
              <span className="font-medium">VRBO:</span> Go to Calendar &gt;
              Settings &gt; Calendar Sync &gt; Copy iCal URL
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
