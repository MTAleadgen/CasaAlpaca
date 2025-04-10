/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)"
])

// Create the middleware handler
export default clerkMiddleware((auth, req) => {
  // Handle custom redirects before auth
  if (req.nextUrl.pathname === '/admin') {
    const url = new URL('/admin/property', req.url)
    return NextResponse.redirect(url)
  }
  
  // For all other routes, continue with default behavior
  return NextResponse.next()
})

// Configuration for the middleware
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

// Note: The /admin and /api/admin/* routes have additional protection in their components/handlers
