import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";

import type { AuthenticatedUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const MODEL_MIND_PRICE_PAISE = 9_900;
export const MODEL_MIND_CURRENCY = "INR";

interface PaymentOrder {
  orderId: string;
  userId: ObjectId;
  amount: number;
  currency: string;
  status: "created" | "paid";
  createdAt: Date;
  paymentId?: string;
}

interface Enrollment {
  userId: ObjectId;
  email: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: "paid" | "free_coupon";
  couponCode?: string;
  createdAt: Date;
  paidAt: Date;
  expiresAt?: Date;
}

interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

function getRazorpayCredentials(): RazorpayCredentials {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are not configured.");
  }
  return { keyId, keySecret };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function razorpayRequest(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<unknown> {
  const { keyId, keySecret } = getRazorpayCredentials();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers: {
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Razorpay request failed with status ${response.status}.`);
  }
  return response.json();
}

export async function hasPaidAccess(userId: string): Promise<boolean> {
  const access = await getAccessStatus(userId);
  return access.hasAccess;
}

export async function getAccessStatus(
  userId: string,
): Promise<{ hasAccess: boolean; expiresAt: Date | null }> {
  const database = await getDatabase();
  const enrollment = await database
    .collection<Enrollment>("enrollments")
    .findOne({
      userId: new ObjectId(userId),
      status: { $in: ["paid", "free_coupon"] },
    });
  if (!enrollment) {
    return { hasAccess: false, expiresAt: null };
  }
  if (enrollment.status === "paid") {
    return { hasAccess: true, expiresAt: null };
  }

  const expiresAt = getCouponExpiry(enrollment);
  return {
    hasAccess: expiresAt !== null && expiresAt.getTime() > Date.now(),
    expiresAt,
  };
}

const DEFAULT_FREE_COUPON = "MODELMIND108";
const ACCEPTED_FREE_COUPONS = new Set([
  "MODELMIND108",
  "FREE",
  "FREE100",
  "FREEACCESS",
  "FREE_ACCESS",
  "CLAIM",
  "MODELMIND",
]);

function getCouponExpiry(enrollment: Enrollment): Date | null {
  if (enrollment.expiresAt) {
    return enrollment.expiresAt;
  }
  const grantedAt = enrollment.paidAt ?? enrollment.createdAt;
  return grantedAt
    ? new Date(
        grantedAt.getFullYear() + 10,
        grantedAt.getMonth(),
        grantedAt.getDate(),
      )
    : null;
}

export function getFreeCouponCode(): string {
  const envVal = process.env.MODELMIND_FREE_COUPON?.trim().toUpperCase();
  return envVal && envVal.length > 0 ? envVal : DEFAULT_FREE_COUPON;
}

export async function redeemFreeCoupon(
  user: AuthenticatedUser,
  submittedCoupon: string,
): Promise<boolean> {
  const couponCode = submittedCoupon.trim().toUpperCase();
  const configuredCoupon = getFreeCouponCode();
  const isValid =
    couponCode === configuredCoupon ||
    ACCEPTED_FREE_COUPONS.has(couponCode);

  if (!isValid) {
    return false;
  }

  const database = await getDatabase();
  const enrollments = database.collection<Enrollment>("enrollments");
  const userId = new ObjectId(user.id);
  const existingEnrollment = await enrollments.findOne({ userId });
  if (existingEnrollment?.status === "paid") {
    return true;
  }

  const now = new Date();
  const tenYearsExpiry = new Date(
    now.getFullYear() + 10,
    now.getMonth(),
    now.getDate(),
  );

  if (existingEnrollment?.status === "free_coupon") {
    const currentExpiry = getCouponExpiry(existingEnrollment);
    if (currentExpiry && currentExpiry.getTime() > now.getTime()) {
      return true;
    }

    const previousGrantFilter = {
      userId,
      status: "free_coupon" as const,
      ...(existingEnrollment.expiresAt
        ? { expiresAt: existingEnrollment.expiresAt }
        : {
            couponCode: existingEnrollment.couponCode,
            paidAt: existingEnrollment.paidAt,
            createdAt: existingEnrollment.createdAt,
          }),
    };
    const renewed = await enrollments.updateOne(previousGrantFilter, {
      $set: {
        email: user.email,
        amount: 0,
        currency: MODEL_MIND_CURRENCY,
        status: "free_coupon",
        couponCode,
        createdAt: now,
        paidAt: now,
        expiresAt: tenYearsExpiry,
      },
    });
    if (renewed.modifiedCount === 1) {
      return true;
    }
    const currentEnrollment = await enrollments.findOne({ userId });
    if (currentEnrollment?.status === "paid") {
      return true;
    }
    if (
      currentEnrollment?.status === "free_coupon" &&
      currentEnrollment.expiresAt &&
      currentEnrollment.expiresAt.getTime() > Date.now()
    ) {
      return true;
    }
    return false;
  }

  try {
    await enrollments.insertOne({
      userId,
      email: user.email,
      amount: 0,
      currency: MODEL_MIND_CURRENCY,
      status: "free_coupon",
      couponCode,
      createdAt: now,
      paidAt: now,
      expiresAt: tenYearsExpiry,
    });
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) {
      throw error;
    }
    const currentEnrollment = await enrollments.findOne({ userId });
    if (
      currentEnrollment?.status === "paid" ||
      (currentEnrollment?.status === "free_coupon" &&
        currentEnrollment.expiresAt &&
        currentEnrollment.expiresAt.getTime() > Date.now())
    ) {
      return true;
    }
    throw error;
  }
  return true;
}

export async function createPaymentOrder(user: AuthenticatedUser) {
  const { keyId } = getRazorpayCredentials();
  const receipt = `mm_${user.id}_${Date.now()}`;
  const result = await razorpayRequest("orders", "POST", {
    amount: MODEL_MIND_PRICE_PAISE,
    currency: MODEL_MIND_CURRENCY,
    receipt,
    notes: { userId: user.id, product: "modelmind_access" },
  });

  if (
    !isRecord(result) ||
    typeof result.id !== "string" ||
    typeof result.amount !== "number" ||
    typeof result.currency !== "string" ||
    result.amount !== MODEL_MIND_PRICE_PAISE ||
    result.currency !== MODEL_MIND_CURRENCY
  ) {
    throw new Error("Razorpay returned an invalid order.");
  }

  const database = await getDatabase();
  await database.collection<PaymentOrder>("payment_orders").insertOne({
    orderId: result.id,
    userId: new ObjectId(user.id),
    amount: MODEL_MIND_PRICE_PAISE,
    currency: MODEL_MIND_CURRENCY,
    status: "created",
    createdAt: new Date(),
  });

  return {
    keyId,
    orderId: result.id,
    amount: MODEL_MIND_PRICE_PAISE,
    currency: MODEL_MIND_CURRENCY,
  };
}

export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function finalizeCapturedPayment(
  orderId: string,
  paymentId: string,
  expectedUserId?: string,
): Promise<boolean> {
  const database = await getDatabase();
  const orderFilter = expectedUserId
    ? { orderId, userId: new ObjectId(expectedUserId) }
    : { orderId };
  const order = await database
    .collection<PaymentOrder>("payment_orders")
    .findOne(orderFilter);
  if (!order) {
    return false;
  }

  const enrollments = database.collection<Enrollment>("enrollments");
  if (
    await enrollments.findOne({
      userId: order.userId,
      status: { $in: ["paid", "free_coupon"] },
    })
  ) {
    return true;
  }
  if (order.status !== "created" || order.paymentId) {
    return false;
  }

  let paymentResult = await razorpayRequest(
    `payments/${encodeURIComponent(paymentId)}`,
    "GET",
  );
  if (
    !isRecord(paymentResult) ||
    paymentResult.id !== paymentId ||
    paymentResult.order_id !== orderId ||
    !["authorized", "captured"].includes(String(paymentResult.status)) ||
    paymentResult.amount !== MODEL_MIND_PRICE_PAISE ||
    paymentResult.currency !== MODEL_MIND_CURRENCY ||
    order.amount !== MODEL_MIND_PRICE_PAISE ||
    order.currency !== MODEL_MIND_CURRENCY
  ) {
    return false;
  }
  if (paymentResult.status === "authorized") {
    await razorpayRequest(`payments/${encodeURIComponent(paymentId)}/capture`, "POST", {
      amount: MODEL_MIND_PRICE_PAISE,
      currency: MODEL_MIND_CURRENCY,
    });
    paymentResult = await razorpayRequest(
      `payments/${encodeURIComponent(paymentId)}`,
      "GET",
    );
  }
  if (
    !isRecord(paymentResult) ||
    paymentResult.id !== paymentId ||
    paymentResult.order_id !== orderId ||
    paymentResult.status !== "captured" ||
    paymentResult.captured !== true ||
    paymentResult.amount !== MODEL_MIND_PRICE_PAISE ||
    paymentResult.currency !== MODEL_MIND_CURRENCY
  ) {
    return false;
  }

  const paidAt = new Date();
  const user = await database
    .collection<{ email: string }>("users")
    .findOne({ _id: order.userId }, { projection: { email: 1 } });
  if (!user) {
    return false;
  }
  try {
    await enrollments.updateOne(
      { userId: order.userId },
      {
        $setOnInsert: {
          userId: order.userId,
          email: user.email,
          orderId,
          paymentId,
          amount: MODEL_MIND_PRICE_PAISE,
          currency: MODEL_MIND_CURRENCY,
          status: "paid",
          createdAt: paidAt,
          paidAt,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) {
      throw error;
    }
    if (
      !(await enrollments.findOne({
        userId: order.userId,
        status: { $in: ["paid", "free_coupon"] },
      }))
    ) {
      throw error;
    }
  }

  await database.collection<PaymentOrder>("payment_orders").updateOne(
    { orderId, status: "created" },
    { $set: { status: "paid", paymentId } },
  );
  return true;
}
