import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Gift, Home, Settings } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard | Casa Alpaca",
  description: "Manage your Casa Alpaca vacation rental"
}

export default function AdminDashboardPage() {
  return (
    <div className="py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/property" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Home className="mr-2 size-5" />
                Vacation Rental
              </CardTitle>
              <CardDescription>
                Manage property details, photos, and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Update property information, pricing, amenities, and more.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/extras" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Gift className="mr-2 size-5" />
                Extras
              </CardTitle>
              <CardDescription>
                Manage early check-in, late check-out and other add-ons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Configure optional services that guests can add to their stay.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings" className="block">
          <Card className="hover:border-primary h-full transition-all hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Settings className="mr-2 size-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage global settings, payment options, and notifications.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
