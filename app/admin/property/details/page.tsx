"use server"

import {
  getPropertyByIdAction,
  getAllPropertiesAction
} from "@/actions/db/properties-actions"
import { PropertyForm } from "./_components/property-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Property Details | Casa Alpaca Admin",
  description: "Manage your property details"
}

export default async function PropertyDetailsPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  return (
    <div className="py-10">
      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <Link href="/admin/property">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Property Details
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage property information and settings
        </p>
      </div>

      <Suspense fallback={<PropertyFormSkeleton />}>
        <PropertyFormLoader propertyId={searchParams.id} />
      </Suspense>
    </div>
  )
}

async function PropertyFormLoader({ propertyId }: { propertyId?: string }) {
  const { userId } = await auth()

  if (!userId) return <p>Please sign in to access property details</p>

  let property = null

  if (propertyId) {
    const { data } = await getPropertyByIdAction(propertyId)
    property = data || null
  }

  // Load all properties for the dropdown
  const { data: properties } = await getAllPropertiesAction(userId)

  return <PropertyForm property={property} allProperties={properties || []} />
}

function PropertyFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[300px]" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-10 w-[150px]" />
    </div>
  )
}
