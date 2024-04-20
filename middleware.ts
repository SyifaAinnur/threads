// Resource: https://clerk.com/docs/nextjs/middleware#auth-middleware
// Copy the middleware code as it is from the above resource

import { clerkMiddleware } from "@clerk/nextjs/server";


export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)',
    '/'
]
};