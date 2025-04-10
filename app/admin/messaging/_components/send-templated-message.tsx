"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { SelectMessageTemplate, SelectProperty } from "@/db/schema"
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
import { getMessageTemplatesAction } from "@/actions/db/message-templates-actions"
import { getAllPropertiesAction } from "@/actions/db/properties-actions"
import { sendTemplatedMessageAction } from "@/actions/messaging-actions"

interface SendTemplatedMessageProps {
  phoneNumber: string
  onSuccess?: () => void
}

export default function SendTemplatedMessage({
  phoneNumber,
  onSuccess
}: SendTemplatedMessageProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [templates, setTemplates] = useState<SelectMessageTemplate[]>([])
  const [properties, setProperties] = useState<SelectProperty[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [templateVariables, setTemplateVariables] = useState<string[]>([])

  // Load templates and properties when component mounts
  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        // Load message templates
        const templatesResult = await getMessageTemplatesAction(user.id)
        if (templatesResult.isSuccess) {
          setTemplates(templatesResult.data)
        }

        // Load properties for property variables
        const propertiesResult = await getAllPropertiesAction(user.id)
        if (propertiesResult.isSuccess) {
          setProperties(propertiesResult.data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [user?.id])

  // Update variables when template changes
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateVariables([])
      setVariables({})
      return
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
    if (selectedTemplate?.variables) {
      try {
        const parsedVariables = JSON.parse(
          selectedTemplate.variables
        ) as string[]
        setTemplateVariables(parsedVariables)

        // Initialize variables with empty strings
        const initialVariables: Record<string, string> = {}
        parsedVariables.forEach(v => {
          initialVariables[v] = ""
        })

        setVariables(initialVariables)
      } catch (error) {
        console.error("Error parsing template variables:", error)
        setTemplateVariables([])
        setVariables({})
      }
    } else {
      setTemplateVariables([])
      setVariables({})
    }
  }, [selectedTemplateId, templates])

  const handleSendMessage = async () => {
    if (!user?.id || !selectedTemplateId || !phoneNumber) return

    setIsLoading(true)

    try {
      const result = await sendTemplatedMessageAction({
        userId: user.id,
        phoneNumber,
        templateId: selectedTemplateId,
        variables,
        propertyId: selectedPropertyId || undefined
      })

      if (result.isSuccess) {
        toast.success("Message sent successfully")

        // Reset the form
        setSelectedTemplateId("")
        setSelectedPropertyId("")
        setVariables({})

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error sending templated message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Template</CardTitle>
        <CardDescription>
          Send a predefined message template with personalized variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="template">Select Template</label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isLoading || templates.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
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
          </div>

          {properties.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="property">
                Property (for automatic variable population)
              </label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional: Select a property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground mt-1 text-xs">
                Selecting a property will automatically fill in
                property-specific variables like address, WiFi details, etc.
              </p>
            </div>
          )}

          {templateVariables.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Template Variables</h3>
              {templateVariables.map(variable => (
                <div key={variable} className="space-y-1">
                  <label
                    htmlFor={`var-${variable}`}
                    className="text-muted-foreground text-sm"
                  >
                    {variable.charAt(0).toUpperCase() + variable.slice(1)}
                  </label>
                  <Input
                    id={`var-${variable}`}
                    value={variables[variable] || ""}
                    onChange={e =>
                      handleVariableChange(variable, e.target.value)
                    }
                    placeholder={`Enter ${variable}`}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleSendMessage}
              disabled={
                isLoading ||
                !selectedTemplateId ||
                templates.length === 0 ||
                (templateVariables.length > 0 &&
                  templateVariables.some(v => !variables[v]))
              }
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send Template"}
            </Button>
          </div>

          {templates.length === 0 && (
            <p className="text-muted-foreground mt-2 text-center text-sm">
              No templates available.{" "}
              <a href="/admin/messaging/templates" className="underline">
                Create templates
              </a>{" "}
              first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
