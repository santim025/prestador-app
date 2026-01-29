import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages without token
        if (pathname.startsWith("/auth")) {
          return true
        }
        
        // Allow access to API auth routes
        if (pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Allow access to public assets
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.includes(".")
        ) {
          return true
        }
        
        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
}
