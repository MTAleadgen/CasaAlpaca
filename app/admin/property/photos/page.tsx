"use server"

import { getPropertyAction } from "@/actions/db/properties-actions"
import { PhotoUploader } from "@/app/admin/property/photos/_components/photo-uploader"
import { PhotoGallery } from "@/app/admin/property/photos/_components/photo-gallery"

export const metadata = {
  title: "Property Photos | Casa Alpaca Admin",
  description: "Manage photos for your vacation rental property"
}

export default async function PropertyPhotosPage() {
  const { isSuccess, data: property } = await getPropertyAction()

  return (
    <div className="py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Property Photos
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage photos for your vacation rental property
      </p>

      {isSuccess && property ? (
        <div className="space-y-8">
          <PhotoUploader propertyId={property.id} />
          <PhotoGallery propertyId={property.id} />
        </div>
      ) : (
        <div className="rounded-md bg-amber-50 p-4 text-amber-800">
          <p>No property found. Please create a property first.</p>
        </div>
      )}
    </div>
  )
}
