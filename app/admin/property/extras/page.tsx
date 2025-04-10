import { getExtrasAction } from "@/actions/db/extras-actions"
import { getPropertyByIdAction } from "@/actions/db/properties-actions"
import { ExtrasTable } from "@/components/admin/extras/extras-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Property Extras | Casa Alpaca Admin",
  description: "Manage bookable extras for this property"
}

export default async function PropertyExtrasPage({
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
          <h1 className="text-3xl font-bold tracking-tight">Property Extras</h1>
        </div>
        <p className="text-muted-foreground">
          Manage early check-in, late check-out and other add-on services for
          this property
        </p>
      </div>

      <Suspense fallback={<PropertyExtrasSkeleton />}>
        <PropertyExtrasContent propertyId={searchParams.id} />
      </Suspense>
    </div>
  )
}

async function PropertyExtrasContent({ propertyId }: { propertyId?: string }) {
  const { userId } = await auth()

  if (!userId) {
    return <p>Please sign in to access property extras</p>
  }

  if (!propertyId) {
    return <p>Property ID is required</p>
  }

  const { data: property } = await getPropertyByIdAction(propertyId)

  if (!property) {
    return <p>Property not found</p>
  }

  const result = await getExtrasAction(true)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {property.name} - Bookable Extras
        </h2>
        <Link href={`/admin/property/extras/new?propertyId=${propertyId}`}>
          <Button>
            <Plus className="mr-2 size-4" />
            Add New Extra
          </Button>
        </Link>
      </div>

      {result.isSuccess ? (
        <ExtrasTable
          data={result.data || []}
          propertyId={propertyId}
          propertySpecific={true}
        />
      ) : (
        <div className="bg-destructive/15 rounded-md p-4">
          <p className="text-destructive font-medium">
            Error: {result.message}
          </p>
        </div>
      )}
    </div>
  )
}

function PropertyExtrasSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-md" />
    </div>
  )
}
