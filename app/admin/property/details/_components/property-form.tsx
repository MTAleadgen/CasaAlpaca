"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  createPropertyAction,
  updatePropertyAction
} from "@/actions/db/properties-actions"
import { SelectProperty } from "@/db/schema"
import { useRouter } from "next/navigation"
import { InfoIcon } from "lucide-react"

interface PropertyFormProps {
  property: SelectProperty | null
}

export function PropertyForm({ property }: PropertyFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState(property?.name || "Casa Alpaca")
  const [description, setDescription] = useState(
    property?.description || "A beautiful vacation rental property."
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        name,
        description
      }

      if (property) {
        // Update existing property
        const result = await updatePropertyAction(property.id, data)

        if (result.isSuccess) {
          toast({
            title: "Property updated",
            description: "Property details have been updated successfully."
          })

          // Refresh data
          router.refresh()
        } else {
          toast({
            title: "Failed to update property",
            description: result.message,
            variant: "destructive"
          })
        }
      } else {
        // Create new property
        const result = await createPropertyAction(data)

        if (result.isSuccess) {
          toast({
            title: "Property created",
            description: "Property has been created successfully."
          })

          // Redirect to property page
          router.push("/admin/property")
          router.refresh()
        } else {
          toast({
            title: "Failed to create property",
            description: result.message,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-muted mb-6 flex items-start rounded-md p-4">
          <InfoIcon className="mr-3 mt-0.5 size-5 text-blue-600" />
          <div>
            <h3 className="font-medium">Property Information</h3>
            <p className="text-muted-foreground text-sm">
              Update basic details about your property. The database schema has
              been simplified to only include essential fields.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Casa Alpaca"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A beautiful vacation rental property..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : property
                ? "Update Property"
                : "Create Property"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
