/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/((?!.+\\.[\\w]+$|_next).*)",
  "/",
  "/(api|trpc)(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)"
])

// Original Clerk middleware
const originalMiddleware = clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // If the route is public, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }
  
  // If the user is logged in, let them view the route
  return NextResponse.next()
})

// Custom middleware to handle redirects
export default async function middleware(request: NextRequest) {
  // Redirect /admin to /admin/property
  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/property', request.url))
  }
  
  // Pass to the original Clerk middleware for auth handling
  return originalMiddleware(request)
}

// Configuration for the middleware
export const config = {
  // Skip middleware for static files and favicon
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

// Note: The /admin and /api/admin/* routes have additional protection
