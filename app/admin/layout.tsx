import AdminNav from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  const { userId } = await auth()
  const adminId = process.env.ADMIN_USER_ID

  // Only allow access to admin routes if user is admin
  if (userId !== adminId) {
    redirect("/")
  }

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
            <h1 className="text-xl font-bold">Casa Alpaca Admin</h1>
          </div>
        </div>
      </header>

      <div className="container pb-12 pt-4">
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
