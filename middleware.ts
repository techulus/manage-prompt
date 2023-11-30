import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/terms",
    "/privacy",
    "/webhooks/(.*)",
    "/w/(.*)",
    "/og",
    "/ai-tools/(.*)",
    "/api/ai-tools/(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
