"use client"

import { getExtrasAction } from "@/actions/db/extras-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { SelectExtra } from "@/db/schema"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ExtrasSelectorProps {
  selectedExtras: SelectExtra[]
  onExtraChange: (extras: SelectExtra[]) => void
}

export function ExtrasSelector({
  selectedExtras,
  onExtraChange
}: ExtrasSelectorProps) {
  const [extras, setExtras] = useState<SelectExtra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available extras on component mount
  useEffect(() => {
    const fetchExtras = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getExtrasAction(false)

        if (result.isSuccess) {
          setExtras(result.data || [])
        } else {
          setError(result.message)
        }
      } catch (error) {
        setError("Failed to load available extras")
      } finally {
        setIsLoading(false)
      }
    }

    fetchExtras()
  }, [])

  // Toggle selection of an extra
  const toggleExtra = (extra: SelectExtra) => {
    const isSelected = selectedExtras.some(e => e.id === extra.id)

    if (isSelected) {
      // Remove from selection
      onExtraChange(selectedExtras.filter(e => e.id !== extra.id))
    } else {
      // Add to selection
      onExtraChange([...selectedExtras, extra])
    }
  }

  // Calculate the total price of selected extras
  const totalPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Extras</CardTitle>
          <CardDescription>Loading available options...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Extras</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (extras.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhance Your Stay</CardTitle>
        <CardDescription>
          Select optional extras to customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {extras.map(extra => (
          <div
            key={extra.id}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
              selectedExtras.some(e => e.id === extra.id)
                ? "border-primary bg-primary/5"
                : "hover:border-muted-foreground"
            }`}
            onClick={() => toggleExtra(extra)}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedExtras.some(e => e.id === extra.id)}
                onCheckedChange={() => toggleExtra(extra)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="font-medium">{extra.name}</div>
                  <div className="font-semibold">
                    {formatCurrency(extra.price / 100)}
                  </div>
                </div>
                {extra.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {extra.description}
                  </p>
                )}
                {extra.duration && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {extra.duration} minutes
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      {selectedExtras.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="font-medium">Total extras:</div>
          <div className="font-semibold">
            {formatCurrency(totalPrice / 100)}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
