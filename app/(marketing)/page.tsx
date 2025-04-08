/*
This server page is the marketing homepage.
*/

"use server"

import { HeroSection } from "@/components/landing/hero"

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
    </div>
  )
}
