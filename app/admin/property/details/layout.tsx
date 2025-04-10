"use server"

import { Suspense } from "react"
import { AnimatedSection } from "@/components/ui/animated-section"

export default async function PropertyDetailsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-8">
      <AnimatedSection className="space-y-6">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </AnimatedSection>
    </div>
  )
}
