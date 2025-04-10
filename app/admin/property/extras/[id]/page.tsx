import { getExtraByIdAction } from "@/actions/db/extras-actions"
import { getPropertyByIdAction } from "@/actions/db/properties-actions"
import { ExtraForm } from "@/components/admin/extras/extra-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit Property Extra | Casa Alpaca Admin",
  description: "Edit a bookable extra for this property"
}

interface EditPropertyExtraPageProps {
  params: {
    id: string
  }
  searchParams: {
    propertyId?: string
  }
}

export default async function EditPropertyExtraPage({
  params,
  searchParams
}: EditPropertyExtraPageProps) {
  const { userId } = await auth()

  if (!userId) {
    return <p>Please sign in to access property extras</p>
  }

  const propertyId = searchParams.propertyId

  if (!propertyId) {
    return <p>Property ID is required</p>
  }

  const { data: property } = await getPropertyByIdAction(propertyId)

  if (!property) {
    return <p>Property not found</p>
  }

  // If the ID is "new", render the form for creating a new extra
  if (params.id === "new") {
    return (
      <div className="py-10">
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <Link href={`/admin/property/extras?id=${propertyId}`}>
              <Button variant="outline" size="icon" className="mr-2">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Extra
            </h1>
          </div>
          <p className="text-muted-foreground">
            Add a new bookable extra for {property.name}
          </p>
        </div>
        <ExtraForm propertyId={propertyId} />
      </div>
    )
  }

  // Otherwise, get the existing extra and render the form for editing it
  const result = await getExtraByIdAction(params.id, true)

  if (!result.isSuccess) {
    notFound()
  }

  return (
    <div className="py-10">
      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <Link href={`/admin/property/extras?id=${propertyId}`}>
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Extra</h1>
        </div>
        <p className="text-muted-foreground">
          Edit a bookable extra for {property.name}
        </p>
      </div>
      <ExtraForm defaultValues={result.data} propertyId={propertyId} />
    </div>
  )
}
