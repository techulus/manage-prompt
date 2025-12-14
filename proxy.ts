import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

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
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAppPath = publicAppPaths.some((path) =>
    pathname.startsWith(path),
  );
  if (isPublicAppPath || pathname === "/") {
    return NextResponse.next();
  }

  const session = getSessionCookie(request);
  if (session && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/start", request.nextUrl.href));
  }

  if (!session) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?redirectTo=${encodeURIComponent(request.nextUrl.href)}`,
        process.env.APP_BASE_URL,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
