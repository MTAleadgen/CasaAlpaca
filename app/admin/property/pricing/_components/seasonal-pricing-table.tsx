"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { InfoIcon, PlusCircle, Edit, Trash, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
  getPricingRulesAction,
  getPricingSeasonsAction,
  createSeasonAction,
  updateSeasonAction,
  deleteSeasonAction
} from "@/actions/db/pricing-actions"
import { SelectPricingSeason } from "@/db/schema"

interface Season {
  id: string
  name: string
  startDate: Date
  endDate: Date
  weekdayRate: number
  weekendRate: number
}

interface SeasonalPricingTableProps {
  propertyId: string
  seasons: SelectPricingSeason[]
}

export function SeasonalPricingTable({
  propertyId,
  seasons: initialSeasons
}: SeasonalPricingTableProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [baseWeekdayRate, setBaseWeekdayRate] = useState(0)
  const [baseWeekendRate, setBaseWeekendRate] = useState(0)

  // Form state
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [weekdayRate, setWeekdayRate] = useState(0)
  const [weekendRate, setWeekendRate] = useState(0)

  // Load base rates and seasons from the database on component mount
  useEffect(() => {
    async function fetchPricingData() {
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

        // Fetch seasons
        const seasonsResponse = await getPricingSeasonsAction(propertyId)
        if (seasonsResponse.isSuccess) {
          const formattedSeasons = seasonsResponse.data.map(season => ({
            id: season.id,
            name: season.name,
            startDate: new Date(season.startDate),
            endDate: new Date(season.endDate),
            weekdayRate: season.weekdayRate / 100, // Convert from cents to dollars
            weekendRate: season.weekendRate / 100 // Convert from cents to dollars
          }))
          setSeasons(formattedSeasons)
        }
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

    fetchPricingData()
  }, [propertyId, toast])

  const resetForm = () => {
    setName("")
    setStartDate(new Date())
    setEndDate(new Date())
    setWeekdayRate(baseWeekdayRate)
    setWeekendRate(baseWeekendRate)
    setEditingSeason(null)
  }

  const handleOpenDialog = (season?: Season) => {
    if (season) {
      // Edit mode
      setEditingSeason(season)
      setName(season.name)
      setStartDate(new Date(season.startDate))
      setEndDate(new Date(season.endDate))
      setWeekdayRate(season.weekdayRate)
      setWeekendRate(season.weekendRate)
    } else {
      // Create mode
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select valid dates",
        variant: "destructive"
      })
      return
    }

    // Validate dates
    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      // Convert rates from dollars to cents for storage
      const weekdayRateCents = Math.round(weekdayRate * 100)
      const weekendRateCents = Math.round(weekendRate * 100)

      if (editingSeason) {
        // Update existing season
        const response = await updateSeasonAction(editingSeason.id, {
          name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          weekdayRate: weekdayRateCents,
          weekendRate: weekendRateCents
        })

        if (response.isSuccess) {
          // Update local state
          setSeasons(prev =>
            prev.map(s =>
              s.id === editingSeason.id
                ? {
                    id: response.data.id,
                    name: response.data.name,
                    startDate: new Date(response.data.startDate),
                    endDate: new Date(response.data.endDate),
                    weekdayRate: response.data.weekdayRate / 100,
                    weekendRate: response.data.weekendRate / 100
                  }
                : s
            )
          )

          toast({
            title: "Season updated",
            description: response.message
          })
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive"
          })
        }
      } else {
        // Add new season
        const response = await createSeasonAction({
          propertyId,
          name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          weekdayRate: weekdayRateCents,
          weekendRate: weekendRateCents
        })

        if (response.isSuccess) {
          // Add to local state
          setSeasons(prev => [
            ...prev,
            {
              id: response.data.id,
              name: response.data.name,
              startDate: new Date(response.data.startDate),
              endDate: new Date(response.data.endDate),
              weekdayRate: response.data.weekdayRate / 100,
              weekendRate: response.data.weekendRate / 100
            }
          ])

          toast({
            title: "Season created",
            description: response.message
          })
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive"
          })
        }
      }

      handleCloseDialog()
    } catch (error) {
      console.error("Error saving season:", error)
      toast({
        title: "Error",
        description: "Failed to save season",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (seasonId: string) => {
    if (!confirm("Are you sure you want to delete this season?")) {
      return
    }

    try {
      setIsLoading(true)

      const response = await deleteSeasonAction(seasonId)

      if (response.isSuccess) {
        // Remove from local state
        setSeasons(prev => prev.filter(s => s.id !== seasonId))

        toast({
          title: "Season deleted",
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
      console.error("Error deleting season:", error)
      toast({
        title: "Error",
        description: "Failed to delete season",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Seasonal Pricing Periods</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-1"
            >
              <PlusCircle className="size-4" />
              <span>Add Season</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSeason ? "Edit Season" : "Add New Season"}
              </DialogTitle>
              <DialogDescription>
                Create a seasonal pricing period with custom rates
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Season Name</Label>
                <Input
                  id="name"
                  placeholder="Summer Season"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekday-rate">Weekday Rate</Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                    $
                  </span>
                  <Input
                    id="weekday-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={weekdayRate}
                    onChange={e =>
                      setWeekdayRate(parseFloat(e.target.value) || 0)
                    }
                    className="pl-7"
                    placeholder="100.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekend-rate">Weekend Rate</Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                    $
                  </span>
                  <Input
                    id="weekend-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={weekendRate}
                    onChange={e =>
                      setWeekendRate(parseFloat(e.target.value) || 0)
                    }
                    className="pl-7"
                    placeholder="150.00"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSeason ? "Update Season" : "Add Season"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {seasons.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No seasonal pricing periods defined yet. Add your first season to
            get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Weekday Rate</TableHead>
                <TableHead>Weekend Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map(season => (
                <TableRow key={season.id}>
                  <TableCell className="font-medium">{season.name}</TableCell>
                  <TableCell>
                    {format(new Date(season.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(season.endDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>${season.weekdayRate.toFixed(2)}</TableCell>
                  <TableCell>${season.weekendRate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(season)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(season.id)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
