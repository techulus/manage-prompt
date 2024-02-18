import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/terms", "/privacy"],
  ignoredRoutes: [
    "/webhooks/(.*)",
    "/og",
    "/ai-tools/(.*)",
    "/api/ai-tools/(.*)",
    "/api/run/(.*)",
    "/webhooks/streaming-auth",
  ],
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|webhooks|ai-tools|og).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
