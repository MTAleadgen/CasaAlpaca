"use server"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BaseRatesForm } from "./_components/base-rates-form"
import { SeasonalPricingTable } from "./_components/seasonal-pricing-table"
import { LosDiscountForm } from "./_components/los-discount-form"
import { DateOverridesCalendar } from "./_components/date-overrides-calendar"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { propertiesTable } from "@/db/schema"
import { redirect } from "next/navigation"

export default async function PricingPage() {
  // Get the property from the database
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // For simplicity, we'll get the first property or initialize one if none exists
  const properties = await db.query.properties.findMany({
    limit: 1
  })

  let propertyId: string

  if (properties.length === 0) {
    // Create a default property if none exists
    const [property] = await db
      .insert(propertiesTable)
      .values({
        name: "Casa Alpaca",
        description: "Beautiful mountainside retreat"
      })
      .returning()

    propertyId = property.id
  } else {
    propertyId = properties[0].id
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">
          Set your property's pricing rules and seasonal rates
        </p>
      </div>

      <Tabs defaultValue="base-rates">
        <TabsList className="mb-6">
          <TabsTrigger value="base-rates">Base Rates</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Pricing</TabsTrigger>
          <TabsTrigger value="date-overrides">Date Overrides</TabsTrigger>
          <TabsTrigger value="los-discounts">Stay Length Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="base-rates" className="space-y-4">
          <BaseRatesForm propertyId={propertyId} existingRules={null} />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <SeasonalPricingTable propertyId={propertyId} seasons={[]} />
        </TabsContent>

        <TabsContent value="date-overrides" className="space-y-4">
          <DateOverridesCalendar propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="los-discounts" className="space-y-4">
          <LosDiscountForm propertyId={propertyId} existingRules={null} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
