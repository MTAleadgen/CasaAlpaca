"use client"

import { Button } from "@/components/ui/button"
import { Gift, Home, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="mr-2 size-4" />
  },
  {
    title: "Vacation Rental",
    href: "/admin/property",
    icon: <Home className="mr-2 size-4" />
  },
  {
    title: "Extras",
    href: "/admin/extras",
    icon: <Gift className="mr-2 size-4" />
  }
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map(item => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              {item.icon}
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
