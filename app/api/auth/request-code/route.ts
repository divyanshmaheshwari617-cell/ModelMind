import { randomInt } from "node:crypto";
import { MongoServerError } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";

import {
  authRequestIsSameOrigin,
  enforceRateLimit,
  hashOtp,
  hashRateLimitKey,
} from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const otpLifetimeMs = 10 * 60 * 1000;
const resendCooldownMs = 60 * 1000;
const hourlyWindowMs = 60 * 60 * 1000;
const dailyWindowMs = 24 * 60 * 60 * 1000;

interface OtpChallengeRecord {
  _id: string;
  codeHash: string;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
  nextRequestAt: Date;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function sendBrevoOtp(email: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error(
      "Brevo email is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL on the server.",
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: "ModelMind" },
        to: [{ email }],
        subject: "Your ModelMind verification code",
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#182033"><h2>Verify your email</h2><p>Enter this one-time code in ModelMind:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
        textContent: `Your ModelMind verification code is ${code}. It expires in 10 minutes. If you did not request it, ignore this email.`,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    console.error("Brevo OTP delivery request failed before a response was received.");
    throw new Error("Brevo could not be reached. Please try again later.");
  }

  if (!response.ok) {
    console.error(`Brevo OTP delivery failed with HTTP ${response.status}.`);
    throw new Error(
      "Brevo did not accept the email. Check your sender verification and Brevo account settings.",
    );
  }
}

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Enter a valid email address.", 400);
  }

  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return jsonError("Enter a valid email address.", 400);
  }
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return jsonError(
      "Brevo is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL on the server.",
      503,
    );
  }
  if (!isSupabaseAdminConfigured()) {
    return jsonError(
      "Supabase server configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      503,
    );
  }

  let database: Awaited<ReturnType<typeof getDatabase>>;
  let challengeId: string;
  try {
    challengeId = hashRateLimitKey(`challenge:${email}`);
    database = await getDatabase();
    const forwardedIp =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "local-unavailable";
    await enforceRateLimit(database, `email:${hashRateLimitKey(email)}`, 5, hourlyWindowMs);
    await enforceRateLimit(database, `ip:${hashRateLimitKey(forwardedIp)}`, 20, hourlyWindowMs);
    await enforceRateLimit(
      database,
      `brevo:${hashRateLimitKey("daily-send-budget")}`,
      250,
      dailyWindowMs,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return jsonError("Too many code requests. Wait before trying again.", 429);
    }
    console.error(
      "Could not prepare the ModelMind OTP request.",
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

  const challengeCollection =
    database.collection<OtpChallengeRecord>("otp_challenges");
  const now = new Date();
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = hashOtp(email, code);
  try {
    const challenge = await challengeCollection.findOneAndUpdate(
      {
        _id: challengeId,
        $or: [
          { nextRequestAt: { $lte: now } },
          { nextRequestAt: { $exists: false } },
        ],
      },
      {
        $set: {
          codeHash,
          attempts: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + otpLifetimeMs),
          nextRequestAt: new Date(now.getTime() + resendCooldownMs),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (!challenge) {
      return jsonError("Wait one minute before requesting another code.", 429);
    }
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return jsonError("Wait one minute before requesting another code.", 429);
    }
    throw error;
  }

  try {
    await sendBrevoOtp(email, code);
  } catch (error) {
    await challengeCollection.deleteOne({ _id: challengeId, codeHash });
    console.error("ModelMind could not send a requested OTP.");
    return jsonError(
      error instanceof Error ? error.message : "Could not send the email.",
      503,
    );
  }

  return NextResponse.json({
    message: "If this address can be used, a verification code has been sent.",
  });
}
