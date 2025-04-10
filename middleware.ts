/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authMiddleware } from "@clerk/nextjs"

// Create the middleware handler
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)"
  ],
  
  beforeAuth: (req) => {
    // Handle custom redirects before auth
    if (req.nextUrl.pathname === '/admin') {
      const url = new URL('/admin/property', req.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
})

// Configuration for the middleware
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

// Note: The /admin and /api/admin/* routes have additional protection in their components/handlers
