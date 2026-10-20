import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import {
  finalizeCapturedPayment,
  verifyCheckoutSignature,
} from "@/lib/payment";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("Sign in to verify your payment.", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Payment details are missing.", 400);
  }
  if (!isRecord(payload)) {
    return jsonError("Payment details are invalid.", 400);
  }
  const orderId = payload.razorpay_order_id;
  const paymentId = payload.razorpay_payment_id;
  const signature = payload.razorpay_signature;
  if (
    typeof orderId !== "string" ||
    !/^order_[A-Za-z0-9]+$/.test(orderId) ||
    typeof paymentId !== "string" ||
    !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
    typeof signature !== "string"
  ) {
    return jsonError("Payment details are invalid.", 400);
  }

  try {
    if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
      return jsonError("Payment signature could not be verified.", 400);
    }
    if (!(await finalizeCapturedPayment(orderId, paymentId, user.id))) {
      return jsonError(
        "Payment is not captured or does not match this account.",
        400,
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not verify a ModelMind payment.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return jsonError("Could not verify the payment right now. Please try again.", 503);
  }
}
