"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "./scroll-animation"

interface AlternatingSectionProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  reversed?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
}

export function AlternatingSection({
  title,
  description,
  imageSrc,
  imageAlt,
  reversed = false,
  className = "",
  imageClassName = "",
  contentClassName = ""
}: AlternatingSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 py-16 md:gap-12 md:py-20 lg:gap-16 lg:py-24",
        reversed ? "md:flex-row-reverse" : "md:flex-row",
        className
      )}
    >
      {/* Image Section */}
      <ScrollAnimation
        direction={reversed ? "from-right" : "from-left"}
        className="w-full md:w-1/2"
      >
        <div
          className={cn(
            "relative h-[400px] w-full overflow-hidden rounded-xl",
            imageClassName
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </ScrollAnimation>

      {/* Content Section */}
      <ScrollAnimation
        direction={reversed ? "from-left" : "from-right"}
        delay={0.2}
        className={cn(
          "flex w-full flex-col justify-center md:w-1/2",
          contentClassName
        )}
      >
        <div className="max-w-xl">
          <h2 className="mb-6 text-3xl font-medium md:text-4xl">{title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </ScrollAnimation>
    </div>
  )
}
