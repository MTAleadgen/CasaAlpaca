"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { SelectExtra } from "@/db/schema"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function DebugExtrasPage() {
  const [extras, setExtras] = useState<SelectExtra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExtras = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/extras")

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        setExtras(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchExtras()
  }, [])

  const runMigration = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // This is just a debug function to show how to run the migration
      // In a real app, you would run the migration from the command line
      alert("In a real app, you would run: npm run db:run-migrations")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Debug: Extras Feature
      </h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Extras API Status</CardTitle>
            <CardDescription>
              Check if the extras API is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading extras...</p>
            ) : error ? (
              <div className="bg-destructive/15 rounded-md p-4">
                <p className="text-destructive font-medium">Error: {error}</p>
                <p className="mt-2 text-sm">
                  This could indicate that the database migration hasn't been
                  run.
                </p>
                <Button
                  onClick={runMigration}
                  className="mt-4"
                  variant="destructive"
                >
                  Run Migration (Debug Only)
                </Button>
              </div>
            ) : extras.length === 0 ? (
              <div>
                <p className="font-medium">No extras found.</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  This could indicate that no extras have been created yet or
                  the database migration hasn't been run.
                </p>
                <Button
                  onClick={runMigration}
                  className="mt-4"
                  variant="default"
                >
                  Run Migration (Debug Only)
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-medium text-green-600">
                  ✓ API is working correctly. Found {extras.length} extras.
                </p>

                <div className="divide-y rounded-md border">
                  {extras.map(extra => (
                    <div key={extra.id} className="p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{extra.name}</h3>
                        <span className="font-semibold">
                          {formatCurrency(extra.price / 100)}
                        </span>
                      </div>
                      {extra.description && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {extra.description}
                        </p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm">
                        <span>Type: {extra.type}</span>
                        {extra.duration && (
                          <span>Duration: {extra.duration} minutes</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Link to the admin interface for managing extras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/extras">Go to Admin Extras Management</Link>
            </Button>
            <p className="text-muted-foreground mt-4 text-sm">
              Note: You must be logged in as an admin user to access this page.
              Make sure your user ID is set as ADMIN_USER_ID in .env.local.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
