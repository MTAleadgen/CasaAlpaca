import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guest Reviews - Casa Alpaca",
  description:
    "Read what our guests have to say about their experience at Casa Alpaca vacation rental"
}

export default function TestimonialsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <div className="container mx-auto py-12">{children}</div>
}
