"use client"

import { useState } from "react"
import { SelectMessageSchedule, SelectMessageTemplate } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Calendar,
  MessageSquare,
  Trash2,
  Edit,
  Power,
  PowerOff
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  deleteMessageScheduleAction,
  toggleMessageScheduleAction
} from "@/actions/db/message-schedules-actions"

interface ScheduleCardProps {
  schedule: SelectMessageSchedule
  template: SelectMessageTemplate | undefined // The associated template
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

export default function ScheduleCard({
  schedule,
  template,
  onEdit,
  onDelete,
  onToggle
}: ScheduleCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Handle delete schedule
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    setIsLoading(true)

    try {
      const result = await deleteMessageScheduleAction(schedule.id)

      if (result.isSuccess) {
        toast.success(result.message)
        onDelete()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast.error("Failed to delete schedule")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle toggle active status
  const handleToggle = async () => {
    setIsLoading(true)

    try {
      const result = await toggleMessageScheduleAction(
        schedule.id,
        !schedule.isActive
      )

      if (result.isSuccess) {
        toast.success(result.message)
        onToggle()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error toggling schedule:", error)
      toast.error("Failed to toggle schedule")
    } finally {
      setIsLoading(false)
    }
  }

  // Format trigger type for display
  const formatTriggerType = (type: string) => {
    switch (type) {
      case "booking_created":
        return "Booking Created"
      case "check_in":
        return "Check-in Day"
      case "check_out":
        return "Check-out Day"
      default:
        return type
    }
  }

  // Format time in 12-hour format with AM/PM
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
    <Card
      className={`overflow-hidden ${!schedule.isActive ? "opacity-60" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-lg font-medium">{schedule.name}</h3>

            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="text-muted-foreground size-4" />
                <span>Template: {template?.name || "Unknown"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-muted-foreground size-4" />
                <span>
                  Trigger: {formatTriggerType(schedule.triggerType)} (
                  {formatDaysOffset(schedule.daysOffset)})
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-muted-foreground size-4" />
                <span>Time: {formatTime(schedule.hour, schedule.minute)}</span>
              </div>
            </div>

            <div className="mt-3">
              <Badge variant={schedule.isActive ? "default" : "outline"}>
                {schedule.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              disabled={isLoading}
              title="Edit schedule"
            >
              <Edit className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggle}
              disabled={isLoading}
              title={schedule.isActive ? "Disable schedule" : "Enable schedule"}
            >
              {schedule.isActive ? (
                <PowerOff className="size-4" />
              ) : (
                <Power className="size-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
              title="Delete schedule"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
