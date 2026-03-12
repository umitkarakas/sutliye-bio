import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  if ((request.headers.get("content-type") || "").includes("application/x-www-form-urlencoded")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}
