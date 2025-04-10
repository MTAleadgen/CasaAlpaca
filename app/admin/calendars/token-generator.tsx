"use client"

import { useState } from "react"
import { CopyIcon, RefreshCwIcon } from "lucide-react"
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
import { generateCalendarTokenAction } from "@/actions/calendar-actions"

export function CalendarTokenGenerator() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [calendarToken, setCalendarToken] = useState("abc123def456ghi789jkl")
  const [showToken, setShowToken] = useState(false)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const calendarUrl = `${baseUrl}/api/calendar/${calendarToken}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(calendarUrl)
    toast({
      title: "Copied!",
      description: "Calendar URL copied to clipboard",
      duration: 3000
    })
  }

  const handleGenerateToken = async () => {
    setIsGenerating(true)
    try {
      // In a real implementation, we would call the server action
      // const result = await generateCalendarTokenAction()
      // if (result.isSuccess) {
      //   setCalendarToken(result.data.token)
      // }

      // For demo purposes, generate a random token
      const randomToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)

      setCalendarToken(randomToken)
      setShowToken(true)

      toast({
        title: "Token generated",
        description: "Your calendar token has been refreshed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Export</CardTitle>
        <CardDescription>
          Generate a unique token to export your bookings to external calendar
          applications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Your Calendar Token</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? "Hide" : "Show"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type={showToken ? "text" : "password"}
              value={calendarToken}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleGenerateToken}
              disabled={isGenerating}
            >
              <RefreshCwIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Calendar URL (iCal)</p>
          <div className="flex gap-2">
            <Input value={calendarUrl} readOnly className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopyUrl}>
              <CopyIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start">
        <div className="text-muted-foreground text-sm">
          <h4 className="mb-1 font-medium">How to use this URL</h4>
          <p>Add this URL to your calendar application to view all bookings:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <span className="font-medium">Google Calendar:</span> Settings
              &gt; Add Calendar &gt; From URL
            </li>
            <li>
              <span className="font-medium">Apple Calendar:</span> File &gt; New
              Calendar Subscription
            </li>
            <li>
              <span className="font-medium">Outlook:</span> Add Calendar &gt;
              From Internet
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
