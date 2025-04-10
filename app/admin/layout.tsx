import AdminNav from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import Image from "next/image"

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Redirect to property page if at root admin path
  if (typeof window !== "undefined" && window.location.pathname === "/admin") {
    redirect("/admin/property")
  }

  const adminId = process.env.ADMIN_USER_ID

  // Only allow access to admin routes if user is admin
  // Temporarily commented out for development
  // if (userId !== adminId) {
  //   redirect("/")
  // }

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background sticky top-0 z-30 border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center">
              <Image
                src="/images/6974955a-8165-45c3-9791-90fd02133fdd.png"
                alt="Casa Alpaca Logo"
                width={150}
                height={40}
                className="h-auto object-contain"
              />
              <span className="ml-2 font-semibold">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container pb-12 pt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <aside className="w-full md:w-[200px]">
            <AdminNav />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
