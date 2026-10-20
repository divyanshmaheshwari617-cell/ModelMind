import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { VisualizationIllustration } from "@/components/layout/PortalSections";
import { getAuthenticatedUser } from "@/lib/auth";
import { visualizations } from "@/lib/visualizations";
import { hasPaidAccess } from "@/lib/payment";

export const metadata: Metadata = {
  title: "All Visualizations | ModelMind",
  description: "Browse and launch every machine-learning visualization included in ModelMind.",
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

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
        <section className="allVisualizationsGrid" aria-label="All ModelMind visualizations">
          {visualizations.map((visualization) => {
            const content = (
              <>
                <strong>{visualization.name}</strong>
                <VisualizationIllustration kind={visualization.kind} />
                {visualization.href ? (
                  <i aria-hidden="true"><ArrowIcon /></i>
                ) : (
                  <span className="allVisualizationComingSoon">Coming soon</span>
                )}
              </>
            );

            return visualization.href ? (
              <a
                className="referenceVisualizationCard allVisualizationItem"
                href={visualization.href}
                key={visualization.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <div
                aria-disabled="true"
                className="referenceVisualizationCard referenceVisualizationUnavailable allVisualizationItem"
                key={visualization.name}
              >
                {content}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
