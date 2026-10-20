import { NextResponse, type NextRequest } from "next/server";

import {
  authRequestIsSameOrigin,
  consumeEmailProof,
  hashPassword,
  type StoredUser,
} from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { getOrCreateSupabaseUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
    return jsonError("Enter a password.", 400);
  }
  const password =
    typeof payload === "object" &&
    payload !== null &&
    "password" in payload &&
    typeof payload.password === "string"
      ? payload.password
      : "";
  if (password.length < 8 || password.length > 128) {
    return jsonError("Your password must be between 8 and 128 characters.", 400);
  }

  try {
    const email = await consumeEmailProof();
    if (!email) {
      return jsonError("Verify your email again before setting a password.", 401);
    }

    const database = await getDatabase();
    const users = database.collection<StoredUser>("users");
    const existingUser = await users.findOne({ email });
    const supabaseUser = existingUser
      ? { id: existingUser.supabaseUserId }
      : await getOrCreateSupabaseUser(email);
    const passwordHash = await hashPassword(password);
    const now = new Date();
    const user = await users.findOneAndUpdate(
      { email },
      {
        $set: {
          passwordHash,
          supabaseUserId: supabaseUser.id,
          passwordUpdatedAt: now,
        },
        $setOnInsert: {
          email,
          createdAt: now,
          displayName: null,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (!user) {
      return jsonError("Could not save your password. Please try again.", 503);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not save the ModelMind account password.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return jsonError("Could not save your password. Please try again.", 503);
  }
}
