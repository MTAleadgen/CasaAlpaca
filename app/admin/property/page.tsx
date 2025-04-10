import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getAllPropertiesAction } from "@/actions/db/properties-actions"
import Link from "next/link"
import {
  DollarSign,
  CalendarRange,
  ImageIcon,
  InfoIcon,
  PlusCircle,
  Gift
} from "lucide-react"
import { auth } from "@clerk/nextjs/server"

export const metadata = {
  title: "Manage Properties | Casa Alpaca Admin",
  description: "Manage your vacation rental properties"
}

export default async function PropertyPage() {
  const { userId } = await auth()
  const { isSuccess, data: properties } = await getAllPropertiesAction(
    userId || ""
  )

  return (
    <div className="py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Vacation Rental Management
          </h1>
          <p className="text-muted-foreground">
            Manage property details, pricing, availability, and more
          </p>
        </div>
        <Link href="/admin/property/details">
          <Button className="flex items-center gap-2">
            <PlusCircle className="size-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {isSuccess && properties && properties.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Properties</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map(property => (
              <Card key={property.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <CardTitle className="font-semibold">
                    {property.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {property.description?.substring(0, 100) ||
                      "No description"}
                    ...
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/property/details?id=${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <InfoIcon className="mr-2 size-4" />
                        Manage Details
                      </Button>
                    </Link>
                    <Link href={`/admin/property/photos?id=${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <ImageIcon className="mr-2 size-4" />
                        Manage Photos
                      </Button>
                    </Link>
                    <Link href={`/admin/property/pricing?id=${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <DollarSign className="mr-2 size-4" />
                        Manage Pricing
                      </Button>
                    </Link>
                    <Link href={`/admin/property/calendar?id=${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <CalendarRange className="mr-2 size-4" />
                        Manage Calendar
                      </Button>
                    </Link>
                    <Link href={`/admin/property/extras?id=${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Gift className="mr-2 size-4" />
                        Manage Extras
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground">
            No properties configured yet. Please add your first property.
          </p>
        </div>
      )}
    </div>
  )
}
