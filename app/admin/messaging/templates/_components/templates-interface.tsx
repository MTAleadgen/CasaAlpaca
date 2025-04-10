"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SelectMessageTemplate } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  createMessageTemplateAction,
  updateMessageTemplateAction,
  deleteMessageTemplateAction
} from "@/actions/db/message-templates-actions"
import TemplateCard from "./template-card"

interface TemplatesInterfaceProps {
  initialTemplates: SelectMessageTemplate[]
}

export default function TemplatesInterface({
  initialTemplates
}: TemplatesInterfaceProps) {
  const { user } = useUser()
  const [templates, setTemplates] =
    useState<SelectMessageTemplate[]>(initialTemplates)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("custom")
  const [description, setDescription] = useState("")
  const [variables, setVariables] = useState("")

  // Scheduling fields
  const [isScheduled, setIsScheduled] = useState(false)
  const [triggerType, setTriggerType] = useState("booking_created")
  const [daysOffset, setDaysOffset] = useState("0")
  const [hour, setHour] = useState("12")
  const [minute, setMinute] = useState("0")
  const [isActive, setIsActive] = useState(true)

  const [editingTemplate, setEditingTemplate] =
    useState<SelectMessageTemplate | null>(null)

  // Handle form submission to create or update a template
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id || !name || !content || !type) return

    setIsLoading(true)

    try {
      // Parse variables if provided
      let parsedVariables = null
      if (variables.trim()) {
        try {
          // Accept comma-separated list of variables
          parsedVariables = JSON.stringify(
            variables.split(",").map(v => v.trim())
          )
        } catch (error) {
          toast.error("Invalid variables format. Use comma-separated list.")
          setIsLoading(false)
          return
        }
      }

      // Prepare template data
      const templateData = {
        userId: user.id,
        name,
        content,
        type: type as any,
        description: description || undefined,
        variables: parsedVariables || undefined,

        // Scheduling data
        isScheduled,
        triggerType: isScheduled ? (triggerType as any) : undefined,
        daysOffset: isScheduled ? parseInt(daysOffset) : undefined,
        hour: isScheduled ? parseInt(hour) : undefined,
        minute: isScheduled ? parseInt(minute) : undefined,
        isActive: isScheduled ? isActive : undefined
      }

      let result

      if (editingTemplate) {
        // Update existing template
        result = await updateMessageTemplateAction(
          editingTemplate.id,
          templateData
        )
      } else {
        // Create new template
        result = await createMessageTemplateAction(templateData)
      }

      if (result.isSuccess) {
        toast.success(result.message)

        // Update templates list
        if (editingTemplate) {
          setTemplates(prev =>
            prev.map(t => (t.id === result.data.id ? result.data : t))
          )
        } else {
          setTemplates(prev => [...prev, result.data])
        }

        // Reset form
        resetForm()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error("Failed to save template")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a template
  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    setIsLoading(true)

    try {
      const result = await deleteMessageTemplateAction(templateId)

      if (result.isSuccess) {
        toast.success(result.message)
        setTemplates(prev => prev.filter(t => t.id !== templateId))

        // If deleting the template being edited, reset the form
        if (editingTemplate?.id === templateId) {
          resetForm()
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to edit a template
  const handleEdit = (template: SelectMessageTemplate) => {
    setEditingTemplate(template)
    setName(template.name)
    setContent(template.content)
    setType(template.type)
    setDescription(template.description || "")

    // Parse variables safely
    try {
      const parsedVariables = template.variables
        ? JSON.parse(template.variables)
        : []

      if (Array.isArray(parsedVariables)) {
        setVariables(parsedVariables.join(", "))
      } else {
        setVariables("")
        console.warn(
          "Template variables not in expected format:",
          template.variables
        )
      }
    } catch (error) {
      console.error("Error parsing template variables:", error)
      setVariables("")
    }

    // Set scheduling fields
    setIsScheduled(template.isScheduled || false)
    setTriggerType(template.triggerType || "booking_created")
    setDaysOffset(template.daysOffset?.toString() || "0")
    setHour(template.hour?.toString() || "12")
    setMinute(template.minute?.toString() || "0")
    setIsActive(template.isActive === false ? false : true)
  }

  // Reset the form
  const resetForm = () => {
    setName("")
    setContent("")
    setType("custom")
    setDescription("")
    setVariables("")

    // Reset scheduling fields
    setIsScheduled(false)
    setTriggerType("booking_created")
    setDaysOffset("0")
    setHour("12")
    setMinute("0")
    setIsActive(true)

    setEditingTemplate(null)
  }

  // Helper function to get hours for select
  const getHoursOptions = () => {
    const options = []
    for (let i = 0; i < 24; i++) {
      options.push({
        value: i.toString(),
        label: i.toString().padStart(2, "0") + ":00"
      })
    }
    return options
  }

  // Helper function to get minutes for select
  const getMinutesOptions = () => {
    const options = []
    for (let i = 0; i < 60; i += 5) {
      options.push({
        value: i.toString(),
        label: i.toString().padStart(2, "0")
      })
    }
    return options
  }

  return (
    <div className="grid gap-6">
      {/* Create/Edit Template Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingTemplate ? "Edit Template" : "Create New Template"}
          </CardTitle>
          <CardDescription>
            Create message templates with placeholders using {"{"}
            {"{"}"variable_name"{"}"}
            {"}"} syntax
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name">Template Name</label>
              <Input
                id="name"
                placeholder="E.g., Welcome Message"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="type">Template Type</label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="appointment_reminder">
                    Appointment Reminder
                  </SelectItem>
                  <SelectItem value="appointment_confirmation">
                    Appointment Confirmation
                  </SelectItem>
                  <SelectItem value="payment_confirmation">
                    Payment Confirmation
                  </SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="booking_confirmation">
                    Booking Confirmation
                  </SelectItem>
                  <SelectItem value="check_in_instructions">
                    Check-in Instructions
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="content">Message Content</label>
              <Textarea
                id="content"
                placeholder="Hello {{name}}, welcome to our service!"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description">Description (Optional)</label>
              <Input
                id="description"
                placeholder="Brief description of when to use this template"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="variables">Variables (comma-separated)</label>
              <Input
                id="variables"
                placeholder="name, date, time"
                value={variables}
                onChange={e => setVariables(e.target.value)}
              />
            </div>

            {/* Scheduling section */}
            <div className="mt-2 border-t pt-4">
              <div className="mb-4 flex items-center space-x-2">
                <Switch
                  id="schedule-toggle"
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
                <Label htmlFor="schedule-toggle">
                  Enable Automatic Scheduling
                </Label>
              </div>

              {isScheduled && (
                <div className="mt-2 grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="trigger-type">Trigger Event</label>
                    <Select
                      value={triggerType}
                      onValueChange={setTriggerType}
                      required={isScheduled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking_created">
                          When Booking is Created
                        </SelectItem>
                        <SelectItem value="check_in">Check-in Day</SelectItem>
                        <SelectItem value="check_out">Check-out Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="days-offset">Days Offset</label>
                    <Input
                      id="days-offset"
                      type="number"
                      placeholder="Days before/after trigger (negative = before)"
                      value={daysOffset}
                      onChange={e => setDaysOffset(e.target.value)}
                      min="-30"
                      max="30"
                      required={isScheduled}
                    />
                    <p className="text-muted-foreground text-xs">
                      Negative values send before the event, positive values
                      send after. Example: -3 sends 3 days before check-in
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="hour">Hour (24h)</label>
                      <Select
                        value={hour}
                        onValueChange={setHour}
                        required={isScheduled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {getHoursOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="minute">Minute</label>
                      <Select
                        value={minute}
                        onValueChange={setMinute}
                        required={isScheduled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMinutesOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active-toggle"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="active-toggle">Schedule Active</Label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              {editingTemplate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : editingTemplate
                    ? "Update Template"
                    : "Create Template"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Templates</h2>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-muted-foreground text-center">
                You don't have any message templates yet. Create one above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDelete(template.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
