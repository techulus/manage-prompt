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
    "/api/ai-tools/cancel-payment-links",
    "/api/ai-tools/order/download",
    "/api/ai-tools/clean",
    "/api/ai-tools/result",
    "/api/ai-tools/upload",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
