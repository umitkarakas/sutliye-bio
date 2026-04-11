import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { hasDatabaseUrl, queryFirst, withDb } from "@/lib/db";
import { verifyPassword } from "@/lib/server/passwords";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  userId?: string;
  email: string;
  role?: "owner" | "editor";
  exp: number;
};

type AdminLoginRow = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: "owner" | "editor";
  isActive: boolean;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "local-dev-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const encodedPayload = encodeBase64Url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    } satisfies SessionPayload)
  );
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "owner@ocakbasisofrasi.test",
    password: process.env.ADMIN_PASSWORD || "demo12345"
  };
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  if (!hasDatabaseUrl()) {
    const credentials = getAdminCredentials();

    if (normalizedEmail !== credentials.email.trim().toLowerCase() || password !== credentials.password) {
      return null;
    }

    return {
      userId: undefined,
      email: credentials.email,
      role: "owner" as const
    };
  }

  const admin = await withDb((db) =>
    queryFirst<AdminLoginRow>(
      db,
      `
        SELECT
          id,
          email,
          "passwordHash",
          role,
          "isActive"
        FROM "AdminUser"
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [normalizedEmail]
    )
  );

  if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) {
    return null;
  }

  return {
    userId: admin.id,
    email: admin.email,
    role: admin.role
  };
}

export async function touchAdminLogin(userId: string | undefined) {
  if (!userId || !hasDatabaseUrl()) {
    return;
  }

  await withDb((db) =>
    db.query(
      `
        UPDATE "AdminUser"
        SET "lastLoginAt" = NOW()
        WHERE id = $1
      `,
      [userId]
    )
  );
}
