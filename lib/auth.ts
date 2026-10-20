import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { getDatabase, isMongoConfigured } from "@/lib/mongodb";

const sessionCookieName = "modelmind_session";
const emailProofCookieName = "modelmind_email_proof";
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const emailProofLifetimeMs = 10 * 60 * 1000;
const passwordSaltBytes = 16;
const passwordKeyBytes = 64;
const passwordScryptOptions = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  supabaseUserId: string;
  displayName: string | null;
}

interface StoredUser {
  _id: ObjectId;
  email: string;
  supabaseUserId: string;
  displayName?: string | null;
  passwordHash?: string;
  authSessionGeneration?: number;
}

interface RateLimitRecord {
  _id: string;
  windowStartedAt: Date;
  count: number;
  expiresAt: Date;
}

function getHashSecret() {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Set OTP_HASH_SECRET to a random secret of at least 32 characters.",
    );
  }
  return secret;
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, passwordKeyBytes, passwordScryptOptions, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(passwordSaltBytes);
  const key = await derivePasswordKey(password, salt);
  return `scrypt$${passwordScryptOptions.N}$${passwordScryptOptions.r}$${passwordScryptOptions.p}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function passwordMatches(password: string, storedHash: string) {
  const [scheme, n, r, p, saltHex, keyHex, extra] = storedHash.split("$");
  if (
    scheme !== "scrypt" ||
    n !== String(passwordScryptOptions.N) ||
    r !== String(passwordScryptOptions.r) ||
    p !== String(passwordScryptOptions.p) ||
    !/^[a-f0-9]{32}$/i.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/i.test(keyHex ?? "") ||
    extra !== undefined
  ) {
    return false;
  }

  const actual = await derivePasswordKey(password, Buffer.from(saltHex, "hex"));
  const expected = Buffer.from(keyHex, "hex");
  return timingSafeEqual(actual, expected);
}

export function hashOtp(email: string, code: string) {
  return createHmac("sha256", getHashSecret())
    .update(`${email}:${code}`)
    .digest("hex");
}

export function otpMatches(email: string, code: string, storedHash: string) {
  const candidate = Buffer.from(hashOtp(email, code), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return (
    candidate.length === expected.length &&
    timingSafeEqual(candidate, expected)
  );
}

export async function createSession(user: StoredUser) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  const database = await getDatabase();
  const updatedUser = await database
    .collection<StoredUser>("users")
    .findOneAndUpdate(
      { _id: user._id },
      { $inc: { authSessionGeneration: 1 } },
      { returnDocument: "after" },
    );
  if (!updatedUser) {
    throw new Error("Could not update the account session.");
  }
  await database.collection("auth_sessions").insertOne({
    tokenHash: hashAuthToken(token),
    userId: user._id,
    generation: updatedUser.authSessionGeneration ?? 0,
    email: user.email,
    supabaseUserId: user.supabaseUserId,
    createdAt: new Date(),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createEmailProof(email: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + emailProofLifetimeMs);
  const database = await getDatabase();
  await database.collection("auth_proofs").insertOne({
    tokenHash: hashAuthToken(token),
    email,
    createdAt: new Date(),
    expiresAt,
  });
  const cookieStore = await cookies();
  cookieStore.set(emailProofCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function consumeEmailProof() {
  const cookieStore = await cookies();
  const token = cookieStore.get(emailProofCookieName)?.value;
  cookieStore.delete(emailProofCookieName);
  if (!token || !isMongoConfigured()) {
    return null;
  }

  const database = await getDatabase();
  const proof = await database
    .collection<{ email: string }>("auth_proofs")
    .findOneAndDelete({
      tokenHash: hashAuthToken(token),
      expiresAt: { $gt: new Date() },
    });
  return proof?.email ?? null;
}

export async function hasAnotherActiveSession(user: StoredUser) {
  const database = await getDatabase();
  const generation = user.authSessionGeneration ?? 0;
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(sessionCookieName)?.value;
  const generationFilter =
    generation === 0
      ? { $or: [{ generation: 0 }, { generation: { $exists: false } }] }
      : { generation };
  const currentSessionFilter = currentToken
    ? { tokenHash: { $ne: hashAuthToken(currentToken) } }
    : {};
  const otherSession = await database.collection("auth_sessions").findOne({
    userId: user._id,
    expiresAt: { $gt: new Date() },
    ...generationFilter,
    ...currentSessionFilter,
  });
  return Boolean(otherSession);
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (!isMongoConfigured()) {
    return null;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }

  const database = await getDatabase();
  const session = await database.collection("auth_sessions").findOne({
    tokenHash: hashAuthToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session || !(session.userId instanceof ObjectId)) {
    return null;
  }

  const user = await database
    .collection<StoredUser>("users")
    .findOne({ _id: session.userId });
  if (
    !user ||
    (session.generation ?? 0) !== (user.authSessionGeneration ?? 0)
  ) {
    return null;
  }

  return {
    id: user._id.toHexString(),
    email: user.email,
    supabaseUserId: user.supabaseUserId,
    displayName: user.displayName ?? null,
  };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  cookieStore.delete(sessionCookieName);

  if (token && isMongoConfigured()) {
    const database = await getDatabase();
    await database.collection("auth_sessions").deleteOne({
      tokenHash: hashAuthToken(token),
    });
  }
}

export function authRequestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) {
    return false;
  }

  const requestUrl = new URL(request.url);
  if (origin === requestUrl.origin) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return (
      originUrl.protocol === requestUrl.protocol &&
      originUrl.port === requestUrl.port &&
      localHosts.has(originUrl.hostname) &&
      localHosts.has(requestUrl.hostname)
    );
  } catch {
    return false;
  }
}

export function hashRateLimitKey(value: string) {
  return createHmac("sha256", getHashSecret()).update(value).digest("hex");
}

export async function enforceRateLimit(
  database: Awaited<ReturnType<typeof getDatabase>>,
  key: string,
  limit: number,
  windowMs: number,
) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const result = await database
    .collection<RateLimitRecord>("auth_rate_limits")
    .findOneAndUpdate(
      { _id: key },
      [
        {
          $set: {
            windowStartedAt: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$windowStartedAt", null] }, null] },
                    { $lte: ["$windowStartedAt", windowStart] },
                  ],
                },
                now,
                "$windowStartedAt",
              ],
            },
            count: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$windowStartedAt", null] }, null] },
                    { $lte: ["$windowStartedAt", windowStart] },
                  ],
                },
                1,
                { $add: [{ $ifNull: ["$count", 0] }, 1] },
              ],
            },
            expiresAt: new Date(now.getTime() + 2 * windowMs),
          },
        },
      ],
      { upsert: true, returnDocument: "after" },
    );

  if (!result || result.count > limit) {
    throw new Error("RATE_LIMITED");
  }
}

export { ObjectId };
export type { StoredUser };
