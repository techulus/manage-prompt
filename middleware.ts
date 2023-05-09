import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/privacy", "/terms"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
