import { NextResponse, type NextRequest } from "next/server";

import {
  authRequestIsSameOrigin,
  createSession,
  enforceRateLimit,
  hashRateLimitKey,
  hasAnotherActiveSession,
  passwordMatches,
  type StoredUser,
} from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const dummyPasswordHash = `scrypt$16384$8$1$${"0".repeat(32)}$${"0".repeat(128)}`;

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Enter your email and password.", 400);
  }
  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  const password =
    typeof payload === "object" &&
    payload !== null &&
    "password" in payload &&
    typeof payload.password === "string"
      ? payload.password
      : "";
  const forceSignOutOthers =
    typeof payload === "object" &&
    payload !== null &&
    "forceSignOutOthers" in payload &&
    payload.forceSignOutOthers === true;
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length === 0 ||
    password.length > 128
  ) {
    return jsonError("Enter a valid email and password.", 400);
  }

  try {
    const database = await getDatabase();
    const forwardedIp =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "local-unavailable";
    await enforceRateLimit(
      database,
      `login-email:${hashRateLimitKey(email)}`,
      10,
      60 * 60 * 1000,
    );
    await enforceRateLimit(
      database,
      `login-ip:${hashRateLimitKey(forwardedIp)}`,
      30,
      60 * 60 * 1000,
    );
    const user = await database
      .collection<StoredUser>("users")
      .findOne({ email });
    const passwordValid = await passwordMatches(
      password,
      user?.passwordHash ?? dummyPasswordHash,
    );
    if (!user || !passwordValid) {
      return jsonError("The email or password is incorrect.", 401);
    }

    if (!forceSignOutOthers && (await hasAnotherActiveSession(user))) {
      return NextResponse.json(
        {
          code: "ACTIVE_SESSION",
          error: "This account is signed in on another device.",
        },
        { status: 409 },
      );
    }

    await createSession(user);
    await database
      .collection<StoredUser>("users")
      .updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return jsonError("Too many sign-in attempts. Wait before trying again.", 429);
    }
    console.error(
      "Could not sign in to the ModelMind account.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return jsonError("Could not sign in. Please try again.", 503);
  }
}
