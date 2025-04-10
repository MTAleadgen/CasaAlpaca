"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { getAllPropertiesAction } from "@/actions/db/properties-actions"
import PropertyDetailsForm from "./_components/property-details-form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function PropertyVariablesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Property Message Variables</h1>
      <Suspense fallback={<PropertyVariablesSkeleton />}>
        <PropertyVariablesContent />
      </Suspense>
    </div>
  )
}

// Skeleton loader while content is loading
function PropertyVariablesSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="mb-6 h-[40px] w-[200px]" />
        <div className="space-y-4">
          <Skeleton className="h-[50px] w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[50px] w-full" />
            <Skeleton className="h-[50px] w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[50px] w-full" />
            <Skeleton className="h-[50px] w-full" />
          </div>
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-[40px] w-[150px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Content component that fetches data
async function PropertyVariablesContent() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to access property variables</div>
  }

  const { data: properties, isSuccess } = await getAllPropertiesAction(userId)

  if (!isSuccess) {
    return <div>Failed to load properties</div>
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-4">
        Define property details that will be available as variables in your
        message templates. This allows you to easily include property-specific
        information in your communications.
      </p>

      <PropertyDetailsForm properties={properties || []} />
    </div>
  )
}
