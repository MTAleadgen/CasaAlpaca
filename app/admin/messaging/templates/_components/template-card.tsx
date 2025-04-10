"use client"

import { SelectMessageTemplate } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock } from "lucide-react"

interface TemplateCardProps {
  template: SelectMessageTemplate
  onEdit: () => void
  onDelete: () => void
}

export default function TemplateCard({
  template,
  onEdit,
  onDelete
}: TemplateCardProps) {
  // Format the template type for display
  const formatType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format trigger type for display
  const formatTriggerType = (type: string | null | undefined) => {
    if (!type) return ""
    const typeMap: Record<string, string> = {
      booking_created: "When Booking is Created",
      check_in: "Check-in Day",
      check_out: "Check-out Day"
    }
    return typeMap[type] || formatType(type)
  }

  // Format time for display
  const formatTime = (
    hour: number | null | undefined,
    minute: number | null | undefined
  ) => {
    if (
      hour === undefined ||
      hour === null ||
      minute === undefined ||
      minute === null
    )
      return ""
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  // Format offset for display
  const formatOffset = (offset: number | null | undefined) => {
    if (offset === undefined || offset === null) return ""
    if (offset === 0) return "Same day"
    if (offset < 0)
      return `${Math.abs(offset)} day${Math.abs(offset) !== 1 ? "s" : ""} before`
    return `${offset} day${offset !== 1 ? "s" : ""} after`
  }

  // Parse variables safely
  const parseVariables = (
    variablesString: string | null | undefined
  ): string[] => {
    if (!variablesString) return []
    try {
      const parsed = JSON.parse(variablesString)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error("Error parsing variables:", error)
      return []
    }
  }

  // Get variables as array
  const variablesArray = parseVariables(template.variables)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            {template.description && (
              <CardDescription>{template.description}</CardDescription>
            )}
          </div>
          <Badge variant="outline">{formatType(template.type)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose-sm mb-4 max-w-none whitespace-pre-wrap">
          {template.content}
        </div>

        {variablesArray.length > 0 && (
          <div className="mb-4">
            <p className="text-muted-foreground mb-1 text-sm">Variables:</p>
            <div className="flex flex-wrap gap-1">
              {variablesArray.map((variable: string) => (
                <Badge key={variable} variant="secondary">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Show scheduling information if scheduled */}
        {template.isScheduled && (
          <div className="bg-muted mb-4 rounded-md p-3">
            <div className="mb-2 flex items-center gap-2">
              <CalendarClock className="text-primary size-4" />
              <p className="text-sm font-medium">Automatic Scheduling</p>
              {template.isActive ? (
                <Badge
                  variant="outline"
                  className="ml-auto bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-auto bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Inactive
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground space-y-1 text-xs">
              <p>
                <span className="font-medium">Trigger:</span>{" "}
                {formatTriggerType(template.triggerType)}
              </p>
              <p>
                <span className="font-medium">When:</span>{" "}
                {formatOffset(template.daysOffset)} at{" "}
                {formatTime(template.hour, template.minute)}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
