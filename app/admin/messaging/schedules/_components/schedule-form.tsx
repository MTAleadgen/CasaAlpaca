"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { SelectMessageSchedule, SelectMessageTemplate } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  createMessageScheduleAction,
  updateMessageScheduleAction
} from "@/actions/db/message-schedules-actions"
import { getMessageTemplatesAction } from "@/actions/db/message-templates-actions"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ScheduleFormProps {
  initialSchedule?: SelectMessageSchedule
  onSuccess?: () => void
}

// Trigger type options
const triggerOptions = [
  { value: "booking_created", label: "Booking Created" },
  { value: "check_in", label: "Check-in Day" },
  { value: "check_out", label: "Check-out Day" }
]

export default function ScheduleForm({
  initialSchedule,
  onSuccess
}: ScheduleFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [templates, setTemplates] = useState<SelectMessageTemplate[]>([])

  // Form state
  const [name, setName] = useState(initialSchedule?.name || "")
  const [templateId, setTemplateId] = useState(
    initialSchedule?.templateId || ""
  )
  const [triggerType, setTriggerType] = useState(
    initialSchedule?.triggerType || "booking_created"
  )
  const [daysOffset, setDaysOffset] = useState(initialSchedule?.daysOffset || 0)
  const [hour, setHour] = useState(initialSchedule?.hour || 9)
  const [minute, setMinute] = useState(initialSchedule?.minute || 0)
  const [isActive, setIsActive] = useState(initialSchedule?.isActive ?? true)

  // Load message templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      if (!user?.id) return

      try {
        const result = await getMessageTemplatesAction(user.id)
        if (result.isSuccess) {
          setTemplates(result.data)
        }
      } catch (error) {
        console.error("Error loading templates:", error)
        toast.error("Failed to load message templates")
      }
    }

    loadTemplates()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) return

    if (!name || !templateId || !triggerType) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const scheduleData = {
        userId: user.id,
        name,
        templateId,
        triggerType: triggerType as any,
        daysOffset,
        hour,
        minute,
        isActive
      }

      let result

      if (initialSchedule) {
        // Update existing schedule
        result = await updateMessageScheduleAction(
          initialSchedule.id,
          scheduleData
        )
      } else {
        // Create new schedule
        result = await createMessageScheduleAction(scheduleData)
      }

      if (result.isSuccess) {
        toast.success(result.message)

        if (onSuccess) {
          onSuccess()
        }

        // Reset form if creating new
        if (!initialSchedule) {
          setName("")
          setTemplateId("")
          setTriggerType("booking_created")
          setDaysOffset(0)
          setHour(9)
          setMinute(0)
          setIsActive(true)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error saving message schedule:", error)
      toast.error("Failed to save message schedule")
    } finally {
      setIsLoading(false)
    }
  }

  // Format hours in 12-hour format with AM/PM
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:00 ${period}`
  }

  // Format the full time
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    const minuteStr = minute < 10 ? `0${minute}` : minute
    return `${hour12}:${minuteStr} ${period}`
  }

  // Format days offset
  const formatDaysOffset = (offset: number) => {
    if (offset === 0) return "Same day"
    if (offset === 1) return "1 day after"
    if (offset === -1) return "1 day before"
    return offset > 0
      ? `${offset} days after`
      : `${Math.abs(offset)} days before`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialSchedule ? "Edit Schedule" : "Create Schedule"}
        </CardTitle>
        <CardDescription>
          Set up automated messages based on booking events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              placeholder="E.g., Pre-Arrival Message"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Select
              value={templateId}
              onValueChange={setTemplateId}
              disabled={isLoading || templates.length === 0}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                ) : (
                  templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {templates.length === 0 && (
              <p className="text-muted-foreground text-xs">
                No templates available.{" "}
                <a href="/admin/messaging/templates" className="underline">
                  Create templates
                </a>{" "}
                first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Event</Label>
            <Select
              value={triggerType}
              onValueChange={setTriggerType}
              disabled={isLoading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Days Offset: {formatDaysOffset(daysOffset)}</Label>
            <Slider
              min={-3}
              max={3}
              step={1}
              value={[daysOffset]}
              onValueChange={values => setDaysOffset(values[0])}
              disabled={isLoading}
            />
            <p className="text-muted-foreground text-xs">
              Adjust when the message should be sent relative to the trigger
              event.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hour: {formatHour(hour)}</Label>
              <Slider
                min={0}
                max={23}
                step={1}
                value={[hour]}
                onValueChange={values => setHour(values[0])}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Minute: {minute < 10 ? `0${minute}` : minute}</Label>
              <Slider
                min={0}
                max={59}
                step={1}
                value={[minute]}
                onValueChange={values => setMinute(values[0])}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="text-muted-foreground pt-2 text-center text-sm">
            Message will be sent at {formatTime(hour, minute)}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="font-normal">
              Enable this message schedule
            </Label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialSchedule
                  ? "Update Schedule"
                  : "Create Schedule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
