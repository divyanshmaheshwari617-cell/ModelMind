import "server-only";

import { createClient, type User } from "@supabase/supabase-js";

export function isSupabaseAdminConfigured() {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdminClient() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  const perPage = 1000;
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error("Could not look up the linked Supabase account.");
    }
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (match) {
      return match;
    }
    if (data.users.length < perPage) {
      return null;
    }
  }
  throw new Error("Supabase user lookup reached its safety limit.");
}

export async function getOrCreateSupabaseUser(email: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return existingUser;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (!error && data.user) {
    return data.user;
  }

  // A concurrent first login may have created this Supabase identity already.
  const userAfterCreate = await findUserByEmail(email);
  if (userAfterCreate) {
    return userAfterCreate;
  }
  throw new Error("Could not create the linked Supabase account.");
}
