import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function middleware(req) {

  const token = req.cookies.get("session")?.value;

  const url = req.nextUrl;

  // If user has session
  if (token) {

    try {

      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // if logged in and visiting home → redirect dashboard
      if (url.pathname === "/") {

        return NextResponse.redirect(
          new URL("/dashboard", req.url)
        );

      }

      return NextResponse.next();

    } catch {

      // invalid token
      return NextResponse.redirect(
        new URL("/", req.url)
      );

    }

  }

  // If NOT logged in and trying to access protected page

  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/api/orders") ||
    url.pathname.startsWith("/api/queue")
  ) {

    return NextResponse.redirect(
      new URL("/", req.url)
    );

  }

  return NextResponse.next();

}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*"
  ]
};