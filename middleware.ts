import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
]);

const ignoredRoutes = createRouteMatcher([
  "/webhooks/(.*)",
  "/og",
  "/ai-tools/(.*)",
  "/api/ai-tools/(.*)",
  "/api/v1/(.*)",
]);

export default clerkMiddleware(
  (auth, req) => {
    if (!isPublicRoute(req) && !ignoredRoutes(req)) auth().protect();
  },
  {
    debug: false,
  }
);

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|webhooks|ai-tools|og).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
