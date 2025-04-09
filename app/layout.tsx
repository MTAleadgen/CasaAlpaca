/*
The root server layout for the app.
*/

import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import Header from "@/components/landing/header"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Casa Alpaca | Vacation Rental in Ferndale, MI",
    template: "%s | Casa Alpaca"
  },
  description:
    "Experience our unique vacation rental with creative design, modern amenities, and a perfect location near downtown Ferndale's vibrant scene.",
  icons: {
    icon: [
      { url: "/images/3d7d7d36-b99d-4b9b-9ef1-5e7e5b316389.png", sizes: "any" }
    ],
    apple: {
      url: "/images/3d7d7d36-b99d-4b9b-9ef1-5e7e5b316389.png",
      sizes: "180x180"
    }
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background mx-auto min-h-screen w-full scroll-smooth antialiased",
            inter.className
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Header />
            <main className="pt-16">{children}</main>

            <TailwindIndicator />
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
