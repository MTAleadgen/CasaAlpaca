/*
This client component provides the header for the app.
*/

"use client"

import Link from "next/link"
import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-background fixed top-0 z-50 w-full bg-white/90 shadow-sm backdrop-blur-md">
      {/* Green top border line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-[#5CA496]"></div>

      <div className="container mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <Image
                src="/images/3d7d7d36-b99d-4b9b-9ef1-5e7e5b316389.png"
                alt="Casa Alpaca Logo"
                width={96}
                height={96}
                className="rounded-full bg-[#F8F4E3] p-1"
                priority
              />
              <span className="ml-3 hidden font-medium text-[#5CA496] sm:inline-block">
                Casa Alpaca
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden space-x-6 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-[#5CA496]">
            Home
          </Link>
          <Link
            href="/property"
            className="text-sm font-medium hover:text-[#5CA496]"
          >
            Property
          </Link>
          <Link
            href="/testimonials"
            className="text-sm font-medium hover:text-[#5CA496]"
          >
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center">
          <Link href="/booking">
            <Button
              className="rounded-full bg-[#E27D60] px-6 text-white hover:bg-[#C25D40]"
              size="sm"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
