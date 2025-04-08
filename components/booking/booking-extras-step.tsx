"use client"

import { Button } from "@/components/ui/button"
import { ExtrasSelector } from "@/components/booking/extras-selector"
import { SelectExtra } from "@/db/schema"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

interface BookingExtrasStepProps {
  onPrevious: () => void
  onNext: (selectedExtras: SelectExtra[]) => void
  initialExtras?: SelectExtra[]
}

export function BookingExtrasStep({
  onPrevious,
  onNext,
  initialExtras = []
}: BookingExtrasStepProps) {
  const [selectedExtras, setSelectedExtras] =
    useState<SelectExtra[]>(initialExtras)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate the total price of the extras
  const totalExtrasPrice = selectedExtras.reduce(
    (sum, extra) => sum + extra.price,
    0
  )

  const handleNext = () => {
    setIsLoading(true)
    // Pass the selected extras to the parent component
    onNext(selectedExtras)
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Enhance Your Stay</h2>
        <p className="text-muted-foreground">
          Select optional extras to make your stay more comfortable.
        </p>
      </div>

      <ExtrasSelector
        selectedExtras={selectedExtras}
        onExtraChange={setSelectedExtras}
      />

      <div className="border-t pt-4">
        {selectedExtras.length > 0 && (
          <div className="mb-6 flex justify-between text-lg">
            <span className="font-semibold">Total extras:</span>
            <span className="font-bold">
              {formatCurrency(totalExtrasPrice / 100)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 size-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center"
          >
            Continue
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
