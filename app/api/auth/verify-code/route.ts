import { NextResponse, type NextRequest } from "next/server";

import {
  authRequestIsSameOrigin,
  createEmailProof,
  hashRateLimitKey,
  otpMatches,
} from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

interface OtpChallengeRecord {
  _id: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Enter your email and six-digit code.", 400);
  }
  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  const code =
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    typeof payload.code === "string"
      ? payload.code.trim()
      : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    return jsonError("Enter a valid email and six-digit code.", 400);
  }

  let database: Awaited<ReturnType<typeof getDatabase>>;
  let challengeId: string;
  try {
    database = await getDatabase();
    challengeId = hashRateLimitKey(`challenge:${email}`);
  } catch (error) {
    console.error(
      "Could not access the ModelMind verification store.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return jsonError(
      error instanceof Error &&
        (error.message.startsWith("MongoDB is not configured") ||
          error.message.startsWith("Set OTP_HASH_SECRET"))
        ? error.message
        : "Authentication storage is unavailable. Check the server configuration.",
      503,
    );
  }

  const challenges =
    database.collection<OtpChallengeRecord>("otp_challenges");
  const challenge = await challenges.findOne({
    _id: challengeId,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
  if (!challenge || typeof challenge.codeHash !== "string") {
    return jsonError("That code is invalid or expired. Request a new one.", 400);
  }

  if (!otpMatches(email, code, challenge.codeHash)) {
    await challenges.updateOne(
      {
        _id: challengeId,
        codeHash: challenge.codeHash,
        attempts: { $lt: 5 },
        expiresAt: { $gt: new Date() },
      },
      { $inc: { attempts: 1 } },
    );
    return jsonError("That code is incorrect or expired.", 400);
  }

  const consumed = await challenges.deleteOne({
    _id: challengeId,
    codeHash: challenge.codeHash,
    attempts: { $lt: 5 },
    expiresAt: { $gt: new Date() },
  });
  if (consumed.deletedCount !== 1) {
    return jsonError("That code has already been used or expired.", 400);
  }

  try {
    await createEmailProof(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not create the verified-email proof.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return jsonError("Could not continue account setup. Request a new code.", 503);
  }
}
