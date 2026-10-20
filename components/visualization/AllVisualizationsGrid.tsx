"use client";

import { useState } from "react";
import { VisualizationIllustration } from "@/components/layout/PortalSections";
import EmbeddedLabViewer from "@/components/visualization/EmbeddedLabViewer";
import type { VisualizationItem } from "@/lib/visualizations";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

interface AllVisualizationsGridProps {
  items: VisualizationItem[];
}

export default function AllVisualizationsGrid({
  items,
}: AllVisualizationsGridProps) {
  const [activeLab, setActiveLab] = useState<VisualizationItem | null>(null);

  return (
    <>
      <section
        className="allVisualizationsGrid"
        aria-label="All ModelMind visualizations"
      >
        {items.map((visualization) => {
          const content = (
            <>
              <strong>{visualization.name}</strong>
              <VisualizationIllustration kind={visualization.kind} />
              {visualization.href ? (
                <i aria-hidden="true">
                  <ArrowIcon />
                </i>
              ) : (
                <span className="allVisualizationComingSoon">Coming soon</span>
              )}
            </>
          );

          return visualization.href ? (
            <button
              type="button"
              className="referenceVisualizationCard allVisualizationItem"
              key={visualization.name}
              onClick={() => setActiveLab(visualization)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                border: "none",
                font: "inherit",
              }}
            >
              {content}
            </button>
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

      <EmbeddedLabViewer
        lab={activeLab}
        onClose={() => setActiveLab(null)}
      />
    </>
  );
}
