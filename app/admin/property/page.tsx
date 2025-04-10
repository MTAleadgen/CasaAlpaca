import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getPropertyAction } from "@/actions/db/properties-actions"
import Link from "next/link"
import { DollarSign, CalendarRange, ImageIcon, InfoIcon } from "lucide-react"

export const metadata = {
  title: "Manage Property | Casa Alpaca Admin",
  description: "Manage your vacation rental property"
}

export default async function PropertyPage() {
  const { isSuccess, data: property } = await getPropertyAction()

  return (
    <div className="py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Vacation Rental Management
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage property details, pricing, availability, and more
      </p>

      {isSuccess && property ? (
        <div className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">{property.name}</h2>
          <p className="text-muted-foreground">
            {property.description?.substring(0, 100) || "No description"}...
          </p>
        </div>
      ) : (
        <div className="mb-10">
          <p className="text-muted-foreground">
            No property configured yet. Please set up your property details
            first.
          </p>
          <Link href="/admin/property/details">
            <Button className="mt-2">Set Up Property</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/property/details" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <InfoIcon className="mr-2 size-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Manage your property information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Update property name, description, and other details.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/property/photos" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 size-5" />
                Property Photos
              </CardTitle>
              <CardDescription>Manage property images</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Add, update, and arrange photos of your property.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/property/pricing" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 size-5" />
                Pricing
              </CardTitle>
              <CardDescription>Manage your property pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Set base rates, seasonal pricing, and date-specific overrides.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/calendars" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CalendarRange className="mr-2 size-5" />
                Availability
              </CardTitle>
              <CardDescription>Manage booking calendars</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage availability, blocked dates, and calendar
                synchronization.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
