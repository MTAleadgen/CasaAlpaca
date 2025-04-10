"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  InfoIcon,
  Trash,
  X,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react"
import { format, isSameDay, isWeekend, addDays, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  getPricingRulesAction,
  getPriceOverridesAction,
  createOverrideAction,
  deleteOverrideAction
} from "@/actions/db/pricing-actions"
import { SelectPriceOverride } from "@/db/schema"

interface PriceOverride {
  id: string
  date: Date
  price: number
}

interface DateOverridesCalendarProps {
  propertyId: string
}

interface PriceRange {
  min: number
  max: number
  avg: number
  isSamePrice: boolean
}

export function DateOverridesCalendar({
  propertyId
}: DateOverridesCalendarProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [baseWeekdayRate, setBaseWeekdayRate] = useState(0)
  const [baseWeekendRate, setBaseWeekendRate] = useState(0)
  const [overrides, setOverrides] = useState<PriceOverride[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [price, setPrice] = useState<number>(0)
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 0,
    avg: 0,
    isSamePrice: true
  })
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [inputValue, setInputValue] = useState("")

  // Load base rates, existing overrides, and booked dates
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch base rates
        const ratesResponse = await getPricingRulesAction(propertyId)
        if (ratesResponse.isSuccess && ratesResponse.data) {
          // Convert from cents to dollars for display
          setBaseWeekdayRate(ratesResponse.data.baseWeekdayRate / 100)
          setBaseWeekendRate(ratesResponse.data.baseWeekendRate / 100)
        } else {
          // Set default values if no rules exist
          setBaseWeekdayRate(100)
          setBaseWeekendRate(150)
        }

        // Fetch overrides
        const overridesResponse = await getPriceOverridesAction(propertyId)
        if (overridesResponse.isSuccess) {
          const formattedOverrides = overridesResponse.data.map(override => ({
            id: override.id,
            date: new Date(override.date),
            price: override.price / 100 // Convert from cents to dollars
          }))
          setOverrides(formattedOverrides)
        }

        // Create some demo booked dates for now
        // In a real implementation, this would come from the bookings table
        const today = startOfDay(new Date())
        const demoBookedDates = [
          addDays(today, 2),
          addDays(today, 3),
          addDays(today, 10),
          addDays(today, 11),
          addDays(today, 12),
          addDays(today, 20),
          addDays(today, 21)
        ]
        setBookedDates(demoBookedDates)
      } catch (error) {
        console.error("Error loading pricing data:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [propertyId, toast])

  // Get the base price for a date (without overrides)
  const getBasePrice = (date: Date) => {
    return isWeekend(date) ? baseWeekendRate : baseWeekdayRate
  }

  // Get current price for a date (including any overrides)
  const getCurrentPrice = (date: Date) => {
    const override = overrides.find(override =>
      isSameDay(new Date(override.date), date)
    )

    return override ? override.price : getBasePrice(date)
  }

  // Check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date))
  }

  // Filter out booked dates from selection
  const handleCalendarSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([])
      return
    }

    // Filter out any booked dates that might have been selected
    const availableDates = dates.filter(date => !isDateBooked(date))
    setSelectedDates(availableDates)
  }

  // Calculate price range and average for selected dates
  const calculatePriceRange = (dates: Date[]): PriceRange => {
    if (dates.length === 0) {
      return { min: 0, max: 0, avg: 0, isSamePrice: true }
    }

    let min = Number.MAX_VALUE
    let max = Number.MIN_VALUE
    let total = 0

    dates.forEach(date => {
      const currentPrice = getCurrentPrice(date)
      min = Math.min(min, currentPrice)
      max = Math.max(max, currentPrice)
      total += currentPrice
    })

    const avg = total / dates.length
    const isSamePrice = Math.abs(max - min) < 0.01

    return { min, max, avg, isSamePrice }
  }

  // Update price whenever selected dates change
  useEffect(() => {
    if (selectedDates.length > 0) {
      const range = calculatePriceRange(selectedDates)
      setPriceRange(range)
      setPrice(range.avg)

      // Update input display value
      if (!range.isSamePrice && selectedDates.length > 1) {
        setInputValue(`${range.min} - ${range.max}`)
      } else {
        setInputValue(range.avg.toString())
      }
    } else {
      setInputValue("")
    }
  }, [selectedDates])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Extract numeric value for price
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""))
    if (!isNaN(numericValue)) {
      setPrice(numericValue)
    }
  }

  // Handle applying the price to all selected dates
  const handleApplyPrice = async () => {
    if (selectedDates.length === 0) return

    try {
      setIsLoading(true)

      let updatedCount = 0
      let removedCount = 0
      const updatedOverrides = [...overrides]

      // Process each selected date
      for (const date of selectedDates) {
        const basePrice = getBasePrice(date)
        const priceCents = Math.round(price * 100) // Convert to cents for storage

        // Find existing override for this date
        const existingIndex = updatedOverrides.findIndex(override =>
          isSameDay(new Date(override.date), date)
        )

        // If price equals base price, remove override
        if (Math.abs(price - basePrice) < 0.01) {
          if (existingIndex >= 0) {
            // Delete from database
            await deleteOverrideAction(updatedOverrides[existingIndex].id)

            // Remove from local state
            updatedOverrides.splice(existingIndex, 1)
            removedCount++
          }
        } else {
          if (existingIndex >= 0) {
            // Update existing override in database
            const originalId = updatedOverrides[existingIndex].id

            const response = await deleteOverrideAction(originalId)
            if (response.isSuccess) {
              // Add as new (since date is part of the unique constraint)
              const createResponse = await createOverrideAction({
                propertyId,
                date: date.toISOString(),
                price: priceCents
              })

              if (createResponse.isSuccess) {
                // Update in local state
                updatedOverrides[existingIndex] = {
                  id: createResponse.data.id,
                  date,
                  price
                }
              }
            }
          } else {
            // Create new override in database
            const response = await createOverrideAction({
              propertyId,
              date: date.toISOString(),
              price: priceCents
            })

            if (response.isSuccess) {
              // Add to local state
              const newOverride: PriceOverride = {
                id: response.data.id,
                date,
                price
              }
              updatedOverrides.push(newOverride)
            }
          }
          updatedCount++
        }
      }

      setOverrides(updatedOverrides)
      setSelectedDates([])

      // Show toast with summary
      if (updatedCount > 0 || removedCount > 0) {
        let message = ""
        if (updatedCount > 0) {
          message += `${updatedCount} date${updatedCount !== 1 ? "s" : ""} updated. `
        }
        if (removedCount > 0) {
          message += `${removedCount} override${removedCount !== 1 ? "s" : ""} removed.`
        }

        toast({
          title: "Price overrides updated",
          description: message
        })
      }
    } catch (error) {
      console.error("Error applying price overrides:", error)
      toast({
        title: "Error",
        description: "Failed to update price overrides",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting a specific override
  const handleDelete = async (overrideId: string) => {
    try {
      setIsLoading(true)

      const response = await deleteOverrideAction(overrideId)

      if (response.isSuccess) {
        // Update local state
        setOverrides(prev => prev.filter(o => o.id !== overrideId))

        toast({
          title: "Override deleted",
          description: response.message
        })
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting override:", error)
      toast({
        title: "Error",
        description: "Failed to delete override",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if a date has an override
  const isOverrideDate = (date: Date) => {
    return overrides.some(override => isSameDay(new Date(override.date), date))
  }

  // Format the text showing selected dates range
  const formatSelectedDatesRange = () => {
    if (selectedDates.length === 0) return "No dates selected"
    if (selectedDates.length === 1)
      return format(selectedDates[0], "MMMM d, yyyy")

    return `${selectedDates.length} dates selected`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] items-center justify-center pt-6">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <div className="rounded-md border">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleCalendarSelect}
                className="rounded-md"
                disabled={date => isDateBooked(date) || date < new Date()}
                modifiers={{
                  booked: bookedDates,
                  override: overrides.map(o => new Date(o.date))
                }}
                modifiersClassNames={{
                  booked:
                    "bg-destructive/10 text-muted-foreground line-through hover:bg-destructive/20",
                  override:
                    "bg-blue-100 text-blue-900 font-medium hover:bg-blue-200 hover:text-blue-900"
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-medium">Set Price for Selected Dates</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="selected-dates">Selected Dates</Label>
                  <div className="mt-1 text-sm">
                    {formatSelectedDatesRange()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-price">Price per Night</Label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                      $
                    </span>
                    <Input
                      id="override-price"
                      value={inputValue}
                      onChange={handleInputChange}
                      disabled={selectedDates.length === 0}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleApplyPrice}
                  disabled={selectedDates.length === 0 || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Saving..." : "Apply Price to Selected Dates"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="bg-muted/50 border-b px-4 py-3">
                <h3 className="font-medium">Current Overrides</h3>
              </div>

              {overrides.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  No price overrides set
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...overrides]
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(override => (
                          <TableRow key={override.id}>
                            <TableCell>
                              {format(new Date(override.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>${override.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(override.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
