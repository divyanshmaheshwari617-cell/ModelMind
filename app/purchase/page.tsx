import { redirect } from "next/navigation";

import PurchaseGate from "@/components/payment/PurchaseGate";
import { getAuthenticatedUser } from "@/lib/auth";
import { getFreeCouponCode, hasPaidAccess } from "@/lib/payment";

export const dynamic = "force-dynamic";

export default async function PurchasePage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }
  if (await hasPaidAccess(user.id)) {
    redirect("/");
  }

  return (
    <PurchaseGate
      userEmail={user.email}
      demoCouponCode={getFreeCouponCode()}
    />
  );
}
