/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/api/extras",
  "/api/webhooks/clerk",
  "/signin",
  "/signup"
])

export default clerkMiddleware(async (auth, req) => {
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

export const config = {
  // Skip middleware for static files and favicon
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

// Note: The /admin and /api/admin/* routes have additional protection
// by checking the user's admin status in their components/handlers
