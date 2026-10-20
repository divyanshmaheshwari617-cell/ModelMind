import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, clearSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  }

  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not end the ModelMind session.", error);
    return NextResponse.json(
      { error: "Could not sign out. Please try again." },
      { status: 503 },
    );
  }
}
