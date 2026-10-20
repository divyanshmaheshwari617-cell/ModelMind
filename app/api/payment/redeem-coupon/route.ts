import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import { redeemFreeCoupon } from "@/lib/payment";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  }
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to claim demo access." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter the demo coupon code." },
      { status: 400 },
    );
  }
  const couponCode =
    typeof payload === "object" &&
    payload !== null &&
    "couponCode" in payload &&
    typeof payload.couponCode === "string"
      ? payload.couponCode.trim()
      : "";
  if (!couponCode || couponCode.length > 64) {
    return NextResponse.json(
      { error: "Enter a valid coupon code." },
      { status: 400 },
    );
  }

  try {
    if (!(await redeemFreeCoupon(user, couponCode))) {
      return NextResponse.json(
        { error: "That demo coupon is not valid." },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not redeem a ModelMind demo coupon.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Could not activate demo access. Please try again." },
      { status: 503 },
    );
  }
}
