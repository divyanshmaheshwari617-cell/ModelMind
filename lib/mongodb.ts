import "server-only";

import { MongoClient, type Db } from "mongodb";

declare global {
  var modelMindMongoClientPromise: Promise<MongoClient> | undefined;
  var modelMindMongoIndexesPromise: Promise<void> | undefined;
}

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB;
  if (!uri || !databaseName) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI and MONGODB_DB in .env.local.",
    );
  }
  return { uri, databaseName };
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_DB);
}

export async function getDatabase(): Promise<Db> {
  const { uri, databaseName } = getMongoConfig();
  const clientPromise =
    globalThis.modelMindMongoClientPromise ??
    (globalThis.modelMindMongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    }).connect());
  let client: MongoClient;
  try {
    client = await clientPromise;
  } catch (error) {
    globalThis.modelMindMongoClientPromise = undefined;
    globalThis.modelMindMongoIndexesPromise = undefined;
    throw error;
  }
  const database = client.db(databaseName);

  globalThis.modelMindMongoIndexesPromise ??= (async () => {
    await Promise.all([
      database.collection("users").createIndex({ email: 1 }, { unique: true }),
      database
        .collection("users")
        .createIndex({ supabaseUserId: 1 }, { unique: true }),
      database
        .collection("otp_challenges")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database
        .collection("auth_sessions")
        .createIndex({ tokenHash: 1 }, { unique: true }),
      database
        .collection("auth_sessions")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database
        .collection("auth_sessions")
        .createIndex({ userId: 1, expiresAt: 1 }),
      database
        .collection("auth_proofs")
        .createIndex({ tokenHash: 1 }, { unique: true }),
      database
        .collection("auth_proofs")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database
        .collection("auth_rate_limits")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      database
        .collection("payment_orders")
        .createIndex({ orderId: 1 }, { unique: true }),
      database.collection("payment_orders").createIndex(
        { paymentId: 1 },
        { unique: true, sparse: true },
      ),
      database
        .collection("payment_orders")
        .createIndex({ userId: 1, createdAt: -1 }),
      database
        .collection("enrollments")
        .createIndex({ userId: 1 }, { unique: true }),
    ]);

    const enrollmentCollection = database.collection("enrollments");
    const indexes = await enrollmentCollection.listIndexes().toArray();
    for (const index of indexes) {
      if (
        index.unique &&
        index.key.paymentId === 1 &&
        Object.keys(index.key).length === 1 &&
        index.sparse !== true &&
        typeof index.name === "string"
      ) {
        await enrollmentCollection.dropIndex(index.name);
      }
    }
    await enrollmentCollection.createIndex(
      { paymentId: 1 },
      { unique: true, sparse: true },
    );
  })().then(() => undefined);

  try {
    await globalThis.modelMindMongoIndexesPromise;
  } catch (error) {
    globalThis.modelMindMongoIndexesPromise = undefined;
    throw error;
  }
  return database;
}
