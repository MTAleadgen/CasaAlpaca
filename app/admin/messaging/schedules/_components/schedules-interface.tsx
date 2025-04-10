"use client"

import { useState } from "react"
import { SelectMessageSchedule, SelectMessageTemplate } from "@/db/schema"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import ScheduleForm from "./schedule-form"
import ScheduleCard from "./schedule-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SchedulesInterfaceProps {
  initialSchedules: SelectMessageSchedule[]
  templates: SelectMessageTemplate[]
}

export default function SchedulesInterface({
  initialSchedules,
  templates
}: SchedulesInterfaceProps) {
  const { user } = useUser()
  const [schedules, setSchedules] =
    useState<SelectMessageSchedule[]>(initialSchedules)
  const [selectedSchedule, setSelectedSchedule] =
    useState<SelectMessageSchedule | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Group schedules by trigger type
  const schedulesMap = schedules.reduce(
    (acc, schedule) => {
      const key = schedule.triggerType
      acc[key] = [...(acc[key] || []), schedule]
      return acc
    },
    {} as Record<string, SelectMessageSchedule[]>
  )

  // Handle creating a new schedule
  const handleAddSchedule = () => {
    setSelectedSchedule(null)
    setShowForm(true)
  }

  // Handle editing a schedule
  const handleEditSchedule = (schedule: SelectMessageSchedule) => {
    setSelectedSchedule(schedule)
    setShowForm(true)
  }

  // Handle successful form submission
  const handleFormSuccess = () => {
    setShowForm(false)
    // We would normally reload schedules from the server here
    // but for this demo we'll just update the state
    if (selectedSchedule) {
      // If editing, we'd update the schedule in the list
      // This is a placeholder for real functionality
    } else {
      // If creating, we'd add the new schedule to the list
      // This is a placeholder for real functionality
    }
  }

  // Handle schedule deletion
  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  // Handle schedule toggle
  const handleToggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
  }

  // Find template for a given schedule
  const findTemplate = (templateId: string) => {
    return templates.find(t => t.id === templateId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Automated Messages</h2>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSchedule}>
              <Plus className="mr-2 size-4" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <ScheduleForm
              initialSchedule={selectedSchedule || undefined}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Schedules</TabsTrigger>
          <TabsTrigger value="booking_created">Booking Created</TabsTrigger>
          <TabsTrigger value="check_in">Check-in Day</TabsTrigger>
          <TabsTrigger value="check_out">Check-out Day</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {schedules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  template={findTemplate(schedule.templateId)}
                  onEdit={() => handleEditSchedule(schedule)}
                  onDelete={() => handleDeleteSchedule(schedule.id)}
                  onToggle={() => handleToggleSchedule(schedule.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p>
                No message schedules yet. Create a schedule to automate your
                messages.
              </p>
            </div>
          )}
        </TabsContent>

        {Object.entries(schedulesMap).map(([triggerType, triggerSchedules]) => (
          <TabsContent key={triggerType} value={triggerType} className="mt-6">
            {triggerSchedules.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {triggerSchedules.map(schedule => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    template={findTemplate(schedule.templateId)}
                    onEdit={() => handleEditSchedule(schedule)}
                    onDelete={() => handleDeleteSchedule(schedule.id)}
                    onToggle={() => handleToggleSchedule(schedule.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-12 text-center">
                <p>No schedules for this trigger type.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
