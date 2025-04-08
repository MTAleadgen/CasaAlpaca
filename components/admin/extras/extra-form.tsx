"use client"

import {
  createExtraAction,
  updateExtraAction
} from "@/actions/db/extras-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SelectExtra } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

// Form validation schema
const extraFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  duration: z.coerce.number().optional(),
  isActive: z.boolean().default(true)
})

type ExtraFormValues = z.infer<typeof extraFormSchema>

interface ExtraFormProps {
  defaultValues?: SelectExtra
}

export function ExtraForm({ defaultValues }: ExtraFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!defaultValues

  // Default form values
  const form = useForm<ExtraFormValues>({
    resolver: zodResolver(extraFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || undefined,
          type: defaultValues.type,
          price: defaultValues.price / 100,
          duration: defaultValues.duration || undefined,
          isActive: defaultValues.isActive
        }
      : {
          name: "",
          description: "",
          type: "addon",
          price: 0,
          isActive: true
        }
  })

  async function onSubmit(values: ExtraFormValues) {
    setIsSubmitting(true)

    try {
      // Convert price to cents for database storage
      const dataToSubmit = {
        ...values,
        price: Math.round(values.price * 100)
      }

      let result

      if (isEditing) {
        // Update existing extra
        result = await updateExtraAction(defaultValues.id, dataToSubmit)
      } else {
        // Create new extra
        result = await createExtraAction(dataToSubmit)
      }

      if (result.isSuccess) {
        toast.success(
          isEditing
            ? "Extra updated successfully"
            : "Extra created successfully"
        )
        router.push("/admin/extras")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Early Check-in" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name displayed to guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="early_checkin">
                          Early Check-in
                        </SelectItem>
                        <SelectItem value="late_checkout">
                          Late Check-out
                        </SelectItem>
                        <SelectItem value="addon">Add-on Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categorizes the extra for processing logic
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Arrive earlier than the standard check-in time"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description shown to guests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50.00"
                        {...field}
                        onChange={e => {
                          const value =
                            e.target.value === "" ? "0" : e.target.value
                          field.onChange(parseFloat(value))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Price in USD (will be displayed as $
                      {field.value.toFixed(2)})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        value={field.value || ""}
                        onChange={e => {
                          const value =
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Time duration in minutes (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Determines if this extra is available for bookings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/admin/extras")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isEditing ? "Update Extra" : "Create Extra"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
