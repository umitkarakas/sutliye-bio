import { NextResponse } from "next/server";
import { createSessionToken, getAdminCredentials, getSessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isJsonRequest = contentType.includes("application/json");
  let email = "";
  let password = "";

  if (isJsonRequest) {
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
    if (!isJsonRequest) {
      return NextResponse.redirect(new URL("/admin/login?status=invalid", request.url), 303);
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = createSessionToken({ email });
  const response = isJsonRequest
    ? NextResponse.json({ ok: true, email })
    : NextResponse.redirect(new URL("/admin", request.url), 303);

  response.cookies.set({
    name: getSessionCookieName(),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
