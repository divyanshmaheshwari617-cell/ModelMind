"use client";

import { useEffect, useState } from "react";
import PortalSections from "@/components/layout/PortalSections";
import Sidebar, { type Workspace } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ModelVisualizationLab from "@/components/visualization/model-lab/ModelVisualizationLab";

interface DashboardProps {
  userEmail: string;
  isAdmin: boolean;
  demoAccessExpiresAt: string | null;
}

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
}

export default function Dashboard({
  userEmail,
  isAdmin,
  demoAccessExpiresAt,
}: DashboardProps) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>("Dashboard");

  useEffect(() => {
    if (!demoAccessExpiresAt) {
      return;
    }
    const expiresAt = Date.parse(demoAccessExpiresAt);
    if (!Number.isFinite(expiresAt)) {
      return;
    }

    const maxTimeoutMs = 2_147_000_000;
    let timeout: number;
    const checkExpiry = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        window.location.replace("/purchase");
        return;
      }
      timeout = window.setTimeout(
        checkExpiry,
        Math.min(remaining, maxTimeoutMs),
      );
    };
    checkExpiry();
    return () => window.clearTimeout(timeout);
  }, [demoAccessExpiresAt]);

  function renderWorkspace() {
    if (activeWorkspace === "Notebook") {
      return (
        <PortalSections
          section="Notebook"
          onWorkspaceChange={setActiveWorkspace}
          userEmail={userEmail}
        />
      );
    }
    if (
      activeWorkspace === "VideoGPT" ||
      activeWorkspace === "Roadmap" ||
      activeWorkspace === "Dashboard" ||
      activeWorkspace === "Projects" ||
      activeWorkspace === "Community" ||
      activeWorkspace === "Documentation"
    ) {
      return (
        <PortalSections
          section={activeWorkspace}
          onWorkspaceChange={setActiveWorkspace}
          userEmail={userEmail}
        />
      );
    }
    if (activeWorkspace === "Visualizations") {
      return (
        <PortalSections
          section="Visualizations"
          onWorkspaceChange={setActiveWorkspace}
          userEmail={userEmail}
        />
      );
    }
    if (activeWorkspace === "Datasets") {
      return (
        <ComingSoon
          icon="◫"
          title="Datasets"
          description="Dataset management will be available here. Dataset upload remains inside the notebook."
        />
      );
    }
    return <ModelVisualizationLab />;
  }

  return (
    <main className="appShell" data-theme={theme}>
      <Sidebar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        userEmail={userEmail}
        isAdmin={isAdmin}
      />
      <section className="mainArea">
        <Topbar
          activeWorkspace={activeWorkspace}
          userEmail={userEmail}
          theme={theme}
          onThemeToggle={() => {
            const nextTheme = theme === "dark" ? "light" : "dark";
            window.localStorage.setItem("mm-theme", nextTheme);
            setTheme(nextTheme);
          }}
          onWorkspaceChange={setActiveWorkspace}
        />
        <div className="workspace workspaceSingle">{renderWorkspace()}</div>
      </section>
    </main>
  );
}

function ComingSoon({ icon, title, description }: ComingSoonProps) {
  return (
    <div className="comingSoon">
      <div>
        <div className="comingSoonIcon">{icon}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
