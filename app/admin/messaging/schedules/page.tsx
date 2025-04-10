"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { getMessageSchedulesAction } from "@/actions/db/message-schedules-actions"
import { getMessageTemplatesAction } from "@/actions/db/message-templates-actions"
import SchedulesInterface from "./_components/schedules-interface"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SchedulesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Message Scheduling</h1>
      <Suspense fallback={<SchedulesSkeleton />}>
        <SchedulesContent />
      </Suspense>
    </div>
  )
}

// Skeleton loader while content is loading
function SchedulesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="space-y-4">
        <div className="flex">
          <Skeleton className="h-10 w-[400px]" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-[180px] w-full" />
        </div>
      </div>
    </div>
  )
}

// Content component that fetches data
async function SchedulesContent() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to access message schedules</div>
  }

  // Fetch schedules and templates in parallel
  const [schedulesResult, templatesResult] = await Promise.all([
    getMessageSchedulesAction(userId),
    getMessageTemplatesAction(userId)
  ])

  const schedules = schedulesResult.isSuccess ? schedulesResult.data : []
  const templates = templatesResult.isSuccess ? templatesResult.data : []

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-4">
        Create automated message schedules to send predefined templates at
        specific times based on booking events.
      </p>

      <SchedulesInterface initialSchedules={schedules} templates={templates} />
    </div>
  )
}
