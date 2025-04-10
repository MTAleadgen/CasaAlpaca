"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SelectProfile } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateProfileAction } from "@/actions/db/profiles-actions"

interface SettingsInterfaceProps {
  initialProfile: SelectProfile
}

export default function SettingsInterface({
  initialProfile
}: SettingsInterfaceProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [messagingPreference, setMessagingPreference] = useState<
    "whatsapp" | "sms"
  >((initialProfile.messagingPreference as "whatsapp" | "sms") || "sms")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) return

    setIsLoading(true)

    try {
      const result = await updateProfileAction(user.id, {
        messagingPreference: messagingPreference
      })

      if (result.isSuccess) {
        toast.success("Settings updated successfully")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (value: string) => {
    setMessagingPreference(value as "whatsapp" | "sms")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Messaging Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive automated messages from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <RadioGroup
                value={messagingPreference}
                onValueChange={handleValueChange}
                className="grid gap-4"
              >
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <div className="space-y-1">
                    <Label htmlFor="whatsapp" className="font-medium">
                      WhatsApp
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Receive messages through WhatsApp. Requires a valid
                      WhatsApp account on your phone number.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="sms" id="sms" />
                  <div className="space-y-1">
                    <Label htmlFor="sms" className="font-medium">
                      SMS
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Receive messages as standard text messages (SMS).
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <Button type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
