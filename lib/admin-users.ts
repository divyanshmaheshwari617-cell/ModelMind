import "server-only";

import type { Document } from "mongodb";

import { getDatabase } from "@/lib/mongodb";

export interface AdminUserStats {
  totalUsers: number;
  registeredToday: { email: string; registeredAt: Date }[];
  mostRecentLogin: { email: string; loggedInAt: Date } | null;
}

function getUniqueUserPipeline(): Document[] {
  return [
    { $match: { email: { $type: "string" } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: { $toLower: { $trim: { input: "$email" } } },
        email: { $first: "$email" },
        createdAt: { $first: "$createdAt" },
        lastLoginAt: { $max: "$lastLoginAt" },
      },
    },
  ];
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  const database = await getDatabase();
  const users = database.collection("users");
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const uniqueUsers = getUniqueUserPipeline();

  const [countResult, registeredToday, latestLogin] = await Promise.all([
    users
      .aggregate<{ totalUsers: number }>([
        ...uniqueUsers,
        { $count: "totalUsers" },
      ])
      .next(),
    users
      .aggregate<{ email: string; createdAt: Date }>([
        ...uniqueUsers,
        {
          $match: {
            createdAt: { $gte: todayStart, $lt: tomorrowStart },
          },
        },
        { $sort: { createdAt: -1, email: 1 } },
        { $project: { _id: 0, email: 1, createdAt: 1 } },
      ])
      .toArray(),
    users
      .aggregate<{ email: string; lastLoginAt: Date }>([
        ...uniqueUsers,
        { $match: { lastLoginAt: { $type: "date" } } },
        { $sort: { lastLoginAt: -1, email: 1 } },
        { $limit: 1 },
        { $project: { _id: 0, email: 1, lastLoginAt: 1 } },
      ])
      .next(),
  ]);

  return {
    totalUsers: countResult?.totalUsers ?? 0,
    registeredToday: registeredToday.map((user) => ({
      email: user.email,
      registeredAt: user.createdAt,
    })),
    mostRecentLogin: latestLogin
      ? { email: latestLogin.email, loggedInAt: latestLogin.lastLoginAt }
      : null,
  };
}

export function isAdminEmail(email: string) {
  const allowlistedEmails = (process.env.MODELMIND_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowlistedEmails.includes(email.trim().toLowerCase());
}
