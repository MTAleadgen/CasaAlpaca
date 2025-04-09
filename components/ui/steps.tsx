"use client"

import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface Step {
  id: string
  label: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("flex w-full justify-between", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="relative flex flex-col items-center">
            {/* Step circle */}
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                index < currentStep
                  ? "border-[#5CA496] bg-[#5CA496] text-white"
                  : index === currentStep
                    ? "border-[#5CA496] text-[#5CA496]"
                    : "border-gray-300 text-gray-400"
              )}
            >
              {index < currentStep ? (
                <CheckCircle className="size-5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step label */}
            <span
              className={cn(
                "mt-2 text-sm font-medium",
                index <= currentStep ? "text-[#5CA496]" : "text-gray-400"
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line (not on last item) */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 border-t-2",
                index < currentStep ? "border-[#5CA496]" : "border-gray-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
