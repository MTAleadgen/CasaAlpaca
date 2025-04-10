"use client"

import {
  deleteExtraAction,
  toggleExtraStatusAction
} from "@/actions/db/extras-actions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { SelectExtra } from "@/db/schema"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface ExtrasTableProps {
  data: SelectExtra[]
  propertyId?: string
  propertySpecific?: boolean
}

export function ExtrasTable({
  data,
  propertyId,
  propertySpecific = false
}: ExtrasTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this extra? This action cannot be undone."
      )
    ) {
      setIsDeleting(id)

      try {
        const result = await deleteExtraAction(id)

        if (result.isSuccess) {
          toast.success("Extra deleted successfully")
          router.refresh()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error("Failed to delete extra")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setIsToggling(id)

    try {
      const result = await toggleExtraStatusAction(id, !currentStatus)

      if (result.isSuccess) {
        toast.success(
          `Extra ${!currentStatus ? "activated" : "deactivated"} successfully`
        )
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update extra status")
    } finally {
      setIsToggling(null)
    }
  }

  // Generate the correct path for links
  const getEditPath = (id: string) => {
    if (propertySpecific && propertyId) {
      return `/admin/property/extras/${id}?propertyId=${propertyId}`
    }
    return `/admin/extras/${id}`
  }

  const getNewPath = () => {
    if (propertySpecific && propertyId) {
      return `/admin/property/extras/new?propertyId=${propertyId}`
    }
    return `/admin/extras/new`
  }

  if (data.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground mb-4">
          No extras found. Create your first one to get started.
        </p>
        <Link href={getNewPath()}>
          <Button>Create Extra</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(extra => (
            <TableRow key={extra.id}>
              <TableCell className="font-medium">{extra.name}</TableCell>
              <TableCell>
                {extra.type === "early_checkin"
                  ? "Early Check-in"
                  : extra.type === "late_checkout"
                    ? "Late Check-out"
                    : extra.type}
              </TableCell>
              <TableCell>{formatCurrency(extra.price / 100)}</TableCell>
              <TableCell>
                {extra.duration ? `${extra.duration} minutes` : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={extra.isActive}
                    disabled={isToggling === extra.id}
                    onCheckedChange={() =>
                      handleToggleActive(extra.id, extra.isActive)
                    }
                  />
                  <span
                    className={`text-sm ${extra.isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {extra.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={getEditPath(extra.id)}>
                    <Button variant="outline" size="icon">
                      <Edit className="size-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleting === extra.id}
                    onClick={() => handleDelete(extra.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
