import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/terms",
    "/webhooks/(.*)",
    "/w/(.*)",
    "/og",
    "/ai-tools/(.*)",
    "/api/ai-tools/(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
