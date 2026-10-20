import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import { createPaymentOrder, hasPaidAccess } from "@/lib/payment";

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
    return NextResponse.json({ error: "Sign in to purchase access." }, { status: 401 });
  }

  try {
    if (await hasPaidAccess(user.id)) {
      return NextResponse.json(
        { code: "ALREADY_PAID", error: "This account already has access." },
        { status: 409 },
      );
    }

    const order = await createPaymentOrder(user);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(
      "Could not create a ModelMind payment order.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "Could not start checkout. Check the payment configuration and try again." },
      { status: 503 },
    );
  }
}
