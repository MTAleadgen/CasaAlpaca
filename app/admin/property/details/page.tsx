import { getPropertyAction } from "@/actions/db/properties-actions"
import { PropertyForm } from "./_components/property-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Property Details | Casa Alpaca Admin",
  description: "Manage your property details"
}

export default async function PropertyDetailsPage() {
  const { data: property } = await getPropertyAction()

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
          {property
            ? "Update your property information"
            : "Set up your property information"}
        </p>
      </div>

      <PropertyForm property={property || null} />
    </div>
  )
}
