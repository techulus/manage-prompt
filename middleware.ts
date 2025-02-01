import { NextResponse } from "next/server";
import { auth } from "./auth";

const publicAppPaths = [
  "/sign-in",
  "/terms",
  "/privacy",
  "/webhooks",
  "/og",
  "/ai-tools",
  "/api/ai-tools",
  "/api/v1",
  "/api/auth",
  "/embed/chatbot",
];

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  if (req.auth && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/workflows", req.nextUrl.href));
  }

  const isPublicAppPath = publicAppPaths.some((path) =>
    pathname.startsWith(path),
  );
  if (isPublicAppPath || pathname === "/") {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?redirectTo=${encodeURIComponent(req.nextUrl.href)}`,
        req.url,
      ),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
