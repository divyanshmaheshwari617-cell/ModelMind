import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AllVisualizationsGrid from "@/components/visualization/AllVisualizationsGrid";
import { getAuthenticatedUser } from "@/lib/auth";
import { visualizations } from "@/lib/visualizations";
import { hasPaidAccess } from "@/lib/payment";

export const metadata: Metadata = {
  title: "All Visualizations | ModelMind",
  description: "Browse and launch every machine-learning visualization included in ModelMind.",
};

export const dynamic = "force-dynamic";

export default async function AllVisualizationsPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }
  if (!(await hasPaidAccess(user.id))) {
    redirect("/purchase");
  }

  return (
    <main className="allVisualizationsPage">
      <div className="allVisualizationsContent">
        <Link className="allVisualizationsBack" href="/">
          <span aria-hidden="true">←</span> Back to ModelMind
        </Link>
        <header className="allVisualizationsHeading">
          <span className="allVisualizationsIcon" aria-hidden="true">▮</span>
          <div>
            <p>MODELMIND LEARNING LABS</p>
            <h1>All Visualizations</h1>
            <span>Browse the featured apps and every model in the ModelMind learning lab.</span>
          </div>
          <strong>{visualizations.length} visualizations</strong>
        </header>
        <AllVisualizationsGrid items={visualizations} />
      </div>
    </main>
  );
}
