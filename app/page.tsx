import { redirect } from "next/navigation";

import Dashboard from "@/components/dashboard/Dashboard";
import { isAdminEmail } from "@/lib/admin-users";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAccessStatus } from "@/lib/payment";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }
  const access = await getAccessStatus(user.id);
  if (!access.hasAccess) {
    redirect("/purchase");
  }

  return (
    <Dashboard
      userEmail={user.email}
      isAdmin={isAdminEmail(user.email)}
      demoAccessExpiresAt={access.expiresAt?.toISOString() ?? null}
    />
  );
}
