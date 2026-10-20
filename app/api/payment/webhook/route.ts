import { NextResponse, type NextRequest } from "next/server";

import {
  finalizeCapturedPayment,
  verifyWebhookSignature,
} from "@/lib/payment";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
  }

  try {
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    let event: unknown;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
    if (!isRecord(event) || typeof event.event !== "string") {
      return NextResponse.json({ error: "Invalid webhook event." }, { status: 400 });
    }
    if (
      event.event !== "payment.captured" &&
      event.event !== "payment.authorized"
    ) {
      return NextResponse.json({ ok: true });
    }

    const payload = event.payload;
    const paymentEntity =
      isRecord(payload) && isRecord(payload.payment)
        ? payload.payment.entity
        : null;
    if (
      !isRecord(paymentEntity) ||
      typeof paymentEntity.id !== "string" ||
      typeof paymentEntity.order_id !== "string" ||
      !/^pay_[A-Za-z0-9]+$/.test(paymentEntity.id) ||
      !/^order_[A-Za-z0-9]+$/.test(paymentEntity.order_id)
    ) {
      return NextResponse.json({ error: "Invalid captured payment event." }, { status: 400 });
    }

    await finalizeCapturedPayment(paymentEntity.order_id, paymentEntity.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not process a ModelMind payment webhook.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Could not process the payment webhook." },
      { status: 503 },
    );
  }
}
