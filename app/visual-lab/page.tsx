import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import ModelVisualizationLab from "@/components/visualization/model-lab/ModelVisualizationLab";
import { getAuthenticatedUser } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/payment";

export const metadata: Metadata = {
  title: "Gradient Descent Lab | ModelMind",
  description: "Explore gradient descent with an interactive linear regression visualization.",
};

export const dynamic = "force-dynamic";

export default async function VisualLabPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }
  if (!(await hasPaidAccess(user.id))) {
    redirect("/purchase");
  }

  return (
    <main className="visualLabPage">
      <Link className="visualLabBackLink" href="/visualizations">
        <span aria-hidden="true">←</span> Back to all visualizations
      </Link>
      <ModelVisualizationLab />
    </main>
  );
}
