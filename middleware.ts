import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/terms", "/privacy"],
  ignoredRoutes: [
    "/webhooks/(.*)",
    "/og",
    "/ai-tools/(.*)",
    "/api/ai-tools/(.*)",
    "/api/v1/(.*)",
  ],
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|webhooks|ai-tools|og).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
