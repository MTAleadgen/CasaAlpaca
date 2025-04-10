"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { uploadPropertyPhotoAction } from "@/actions/property-actions"

interface PhotoUploaderProps {
  propertyId: string
}

export function PhotoUploader({ propertyId }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP files are allowed")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !propertyId) return

    try {
      setIsUploading(true)
      const result = await uploadPropertyPhotoAction({
        propertyId,
        file: selectedFile
      })

      if (result.isSuccess) {
        toast.success(result.message)
        clearSelection()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Upload Photos</CardTitle>
        <CardDescription>
          Add photos of your property to showcase it to potential guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!previewUrl ? (
          <div className="flex w-full items-center justify-center">
            <label
              htmlFor="photo-upload"
              className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <Upload className="mb-3 size-10 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WebP (MAX. 5MB)
                </p>
              </div>
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        ) : (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-white/80 hover:bg-white"
              onClick={clearSelection}
              disabled={isUploading}
            >
              <X className="size-4" />
            </Button>
            <img
              src={previewUrl}
              alt="Preview"
              className="h-64 w-full rounded-lg border object-contain"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="ml-auto"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
