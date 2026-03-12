import { NextResponse } from "next/server";
import { createSessionToken, getAdminCredentials, getSessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim() || "";
    password = body.password || "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") || "").trim();
    password = String(formData.get("password") || "");
  }

  const credentials = getAdminCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createSessionToken(email);
  const response = contentType.includes("application/json")
    ? NextResponse.json({ ok: true, email })
    : NextResponse.redirect(new URL("/admin", request.url));

  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
