"use server"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guest Reviews - Casa Alpaca",
  description:
    "Read what our guests have to say about their experience at Casa Alpaca vacation rental"
}

export default async function TestimonialsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
