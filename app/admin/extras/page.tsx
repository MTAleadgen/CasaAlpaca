import { getExtrasAction } from "@/actions/db/extras-actions"
import { ExtrasTable } from "@/components/admin/extras/extras-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Manage Extras | Casa Alpaca Admin",
  description: "Manage bookable extras like early check-in and late check-out"
}

export default async function ExtrasPage() {
  const result = await getExtrasAction(true)

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookable Extras</h1>
          <p className="text-muted-foreground">
            Manage early check-in, late check-out and other add-on services
          </p>
        </div>
        <Link href="/admin/extras/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Add New Extra
          </Button>
        </Link>
      </div>

      {result.isSuccess ? (
        <ExtrasTable data={result.data || []} />
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
