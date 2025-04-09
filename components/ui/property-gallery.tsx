"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface PropertyImage {
  src: string
  alt: string
}

interface PropertyGalleryProps {
  images: PropertyImage[]
  className?: string
}

export function PropertyGallery({ images, className }: PropertyGalleryProps) {
  const [api, setApi] = useState<any>()
  const [current, setCurrent] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  // Handle slide change
  const handleSelect = () => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }

  React.useEffect(() => {
    if (!api) return
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)
    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
          align: "center"
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/70 hover:bg-white/90"
          disabled={!canScrollPrev}
        />
        <CarouselNext
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/70 hover:bg-white/90"
          disabled={!canScrollNext}
        />

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 rounded bg-black/50 px-2 py-1 text-sm text-white">
          {current + 1}/{images.length}
        </div>
      </Carousel>

      {/* Thumbnail Navigation */}
      <div className="mt-4 hidden gap-2 overflow-x-auto md:flex">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "relative h-16 w-24 overflow-hidden rounded border-2 transition-all",
              current === index
                ? "border-primary"
                : "hover:border-primary/50 border-transparent"
            )}
          >
            <Image
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
