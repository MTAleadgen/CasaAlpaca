"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { deletePropertyPhotoAction } from "@/actions/property-actions"
import { SelectProperty, SelectPropertyPhoto } from "@/db/schema"

interface PropertyPhotosProps {
  property: SelectProperty
  photos: SelectPropertyPhoto[]
}

export default function PropertyPhotos({
  property,
  photos
}: PropertyPhotosProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const router = useRouter()

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return

    try {
      setIsDeleting(true)
      const result = await deletePropertyPhotoAction({
        propertyId: property.id,
        photoId: photoToDelete
      })

      if (result.isSuccess) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete photo")
    } finally {
      setIsDeleting(false)
      setPhotoToDelete(null)
    }
  }

  if (!photos.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Photos</CardTitle>
          <CardDescription>
            No photos uploaded yet. Use the uploader above to add photos.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Photos</CardTitle>
        <CardDescription>Manage the photos for your property</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={`Property photo ${photo.id}`}
                  fill
                  className="object-cover"
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                    onClick={() => setPhotoToDelete(photo.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this photo? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeletePhoto}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
