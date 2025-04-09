"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: string
  name: string
  location?: string
  rating: number
  text: string
  date?: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  className?: string
  autoplaySpeed?: number
}

export function TestimonialCarousel({
  testimonials,
  className = "",
  autoplaySpeed = 8000
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextTestimonial = useCallback(() => {
    setActiveIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }, [testimonials.length])

  const prevTestimonial = () => {
    setActiveIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (isPaused) return

    const intervalId = setInterval(() => {
      nextTestimonial()
    }, autoplaySpeed)

    return () => clearInterval(intervalId)
  }, [isPaused, nextTestimonial, autoplaySpeed])

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="relative mx-auto max-w-4xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="min-w-full shrink-0 px-6 pb-6 pt-2"
              >
                <div className="flex flex-col items-center text-center">
                  <p className="mb-4 max-w-2xl text-xl italic leading-relaxed text-white/90">
                    "{testimonial.text}"
                  </p>
                  <div className="mt-4">
                    <p className="text-lg font-medium text-white">
                      {testimonial.name}
                    </p>
                    {testimonial.location && (
                      <p className="text-sm text-gray-400">
                        {testimonial.location}
                        {testimonial.date ? ` • ${testimonial.date}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-[6px] rounded-full transition-all",
                activeIndex === index
                  ? "w-10 bg-[#5CA496]"
                  : "w-[6px] bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Controls - placed on sides */}
        <button
          className="absolute -left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none md:-left-16"
          onClick={prevTestimonial}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-6" />
        </button>

        <button
          className="absolute -right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none md:-right-16"
          onClick={nextTestimonial}
          aria-label="Next testimonial"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </div>
  )
}
