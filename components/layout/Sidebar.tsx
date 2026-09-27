"use client";

export type Workspace =
  | "Dashboard"
  | "Notebook"
  | "Datasets"
  | "Dataset Intelligence"
  | "Visual ML"
  | "Video Learning"
  | "Hyperparameter Lab"
  | "Learn"
  | "Roadmap"
  | "Experiments";


interface SidebarProps {
  activeWorkspace: Workspace;

  onWorkspaceChange: (
    workspace: Workspace
  ) => void;
}


const menuItems: {
  icon: string;
  label: Workspace;
}[] = [
  {
    icon: "⌂",
    label: "Dashboard",
  },
  {
    icon: "▣",
    label: "Notebook",
  },
  {
    icon: "◫",
    label: "Datasets",
  },
  {
    icon: "◈",
    label: "Dataset Intelligence",
  },
  {
    icon: "◉",
    label: "Visual ML",
  },

  // Educational video learning
  {
    icon: "▶",
    label: "Video Learning",
  },

  // Interactive model tuning
  {
    icon: "◫",
    label: "Hyperparameter Lab",
  },

  {
    icon: "◇",
    label: "Learn",
  },
  {
    icon: "↗",
    label: "Roadmap",
  },
  {
    icon: "▤",
    label: "Experiments",
  },
];


export default function Sidebar({
  activeWorkspace,
  onWorkspaceChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="brand">
        <div className="brandLogo">
          M
        </div>

        <div>
          <h1>
            ModelMind
          </h1>

          <span>
            AI ML Laboratory
          </span>
        </div>
      </div>


      {/* NAVIGATION */}

      <nav className="sidebarNav">
        {menuItems.map(
          (item) => {
            const isActive =
              activeWorkspace ===
              item.label;

            return (
              <button
                key={item.label}
                type="button"
                className={
                  isActive
                    ? "navItem navItemActive"
                    : "navItem"
                }
                onClick={() =>
                  onWorkspaceChange(
                    item.label
                  )
                }
              >
                <span className="navIcon">
                  {item.icon}
                </span>

                {item.label}
              </button>
            );
          }
        )}
      </nav>


      {/* BOTTOM PRO CARD */}

      <div className="sidebarBottom">
        <div className="proCard">
          <span className="proBadge">
            PRO
          </span>

          <h3>
            Unlock ModelMind Pro
          </h3>

          <p>
            Advanced AI debugging,
            3D visualizations and
            unlimited experiments.
          </p>

          <button type="button">
            View plans
          </button>
        </div>
      </div>

    </aside>
  );
}