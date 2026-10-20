"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export type Workspace =
  | "Dashboard"
  | "Roadmap"
  | "Notebook"
  | "Visualizations"
  | "VideoGPT"
  | "Datasets"
  | "Projects"
  | "Community"
  | "Documentation"
  | "Visual ML";


interface SidebarProps {
  activeWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  userEmail: string;
  isAdmin: boolean;
}


const menuItems: {
  icon: string;
  label: string;
  workspace: Workspace;
}[] = [
  {
    icon: "home",
    label: "Home",
    workspace: "Dashboard",
  },
  {
    icon: "roadmap",
    label: "Roadmaps",
    workspace: "Roadmap",
  },
  {
    icon: "notebook",
    label: "Notebook",
    workspace: "Notebook",
  },
  {
    icon: "visualizations",
    label: "Visualizations",
    workspace: "Visualizations",
  },
  {
    icon: "video",
    label: "VideoGPT",
    workspace: "VideoGPT",
  },
];

const resourceItems: { icon: string; label: string; workspace: Workspace }[] = [
  { icon: "datasets", label: "Datasets", workspace: "Datasets" },
  { icon: "projects", label: "Projects", workspace: "Projects" },
  { icon: "community", label: "Community", workspace: "Community" },
  { icon: "documentation", label: "Documentation", workspace: "Documentation" },
];

function NavigationIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    roadmap: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    notebook: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 3v18M12 8h4M12 12h4M12 16h4" />
      </>
    ),
    visualizations: <path d="M5 20v-7M12 20V4M19 20v-11" />,
    video: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="m10 8 5 2.5-5 2.5zM8 21h8" />
      </>
    ),
    datasets: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </>
    ),
    projects: <path d="M4 5h16v12H9l-5 4z" />,
    community: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
    documentation: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="navIcon">
      {paths[name]}
    </svg>
  );
}


export default function Sidebar({
  activeWorkspace,
  onWorkspaceChange,
  userEmail,
  isAdmin,
}: SidebarProps) {
  const displayName = userEmail.split("@")[0] || "Learner";
  const formattedName = displayName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brandLogo">
          <Image
            src="/modelmind-emblem-clear.png"
            alt=""
            width={1254}
            height={1254}
          />
        </div>
        <h1>Model <span>Mind</span></h1>
      </div>

      <nav className="sidebarNav">
        {menuItems.map((item) => {
          const isActive = activeWorkspace === item.workspace;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "navItem navItemActive" : "navItem"}
              onClick={() => onWorkspaceChange(item.workspace)}
            >
              <NavigationIcon name={item.icon} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebarSectionLabel">Resources</div>
      <nav className="sidebarNav sidebarResourceNav" aria-label="Resources">
        {resourceItems.map((item) => {
          const isActive = activeWorkspace === item.workspace;
          return (
            <button
              key={item.workspace}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "navItem navItemActive" : "navItem"}
              onClick={() => onWorkspaceChange(item.workspace)}
            >
              <NavigationIcon name={item.icon} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        {isAdmin && (
          <Link className="adminUsersNavLink" href="/admin/users">
            <span aria-hidden="true">◷</span>
            User analytics
          </Link>
        )}
        <div className="sidebarAccount">
          <span className="sidebarAvatar">
            {formattedName.charAt(0) || "M"}
          </span>
          <span>
            <strong title={formattedName}>{formattedName}</strong>
            <small>ModelMind learner</small>
          </span>
        </div>
      </div>
    </aside>
  );
}