"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Workspace } from "./Sidebar";
import SignOutButton from "@/components/auth/SignOutButton";

const searchTargets: {
  label: string;
  keywords: string;
  workspace: Workspace;
}[] = [
  { label: "Home", keywords: "home dashboard", workspace: "Dashboard" },
  { label: "Roadmaps", keywords: "roadmap learning path", workspace: "Roadmap" },
  { label: "Notebook", keywords: "jupyter python code", workspace: "Notebook" },
  {
    label: "Visualizations",
    keywords: "visualizations algorithms model labs",
    workspace: "Visualizations",
  },
  { label: "VideoGPT", keywords: "video explain learning", workspace: "VideoGPT" },
  { label: "Datasets", keywords: "data csv files", workspace: "Datasets" },
  { label: "Projects", keywords: "saved work", workspace: "Projects" },
  { label: "Community", keywords: "learners people", workspace: "Community" },
  { label: "Documentation", keywords: "guides help", workspace: "Documentation" },
];

interface TopbarProps {
  activeWorkspace: Workspace;
  userEmail: string;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onWorkspaceChange: (workspace: Workspace) => void;
}

export default function Topbar({
  activeWorkspace,
  userEmail,
  theme,
  onThemeToggle,
  onWorkspaceChange,
}: TopbarProps) {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return searchTargets.slice(0, 4);
    }
    return searchTargets.filter((target) =>
      `${target.label} ${target.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    function openSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
        setIsSearchOpen(true);
      }
    }

    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  function selectWorkspace(workspace: Workspace) {
    onWorkspaceChange(workspace);
    setQuery("");
    setIsSearchOpen(false);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) {
      selectWorkspace(matches[0].workspace);
    }
  }

  return (
    <header className="topbar">
      <form className="workspaceSearch" role="search" onSubmit={handleSearchSubmit}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          ref={searchInput}
          type="search"
          role="combobox"
          value={query}
          aria-label="Search ModelMind workspaces"
          aria-autocomplete="list"
          aria-expanded={isSearchOpen}
          aria-controls="workspaceSearchResults"
          placeholder="Search for topics, tools, datasets, notebooks..."
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
        />
        <kbd>⌘ K</kbd>
        {isSearchOpen && (
          <div
            className="workspaceSearchResults"
            id="workspaceSearchResults"
            role="listbox"
            aria-label="Workspace shortcuts"
          >
            {matches.length > 0 ? (
              matches.map((target) => (
                <button
                  key={target.workspace}
                  type="button"
                  role="option"
                  aria-selected={target.workspace === activeWorkspace}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectWorkspace(target.workspace)}
                >
                  <span>{target.label}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))
            ) : (
              <p>No matching workspace. Try “notebook” or “roadmap”.</p>
            )}
          </div>
        )}
      </form>

      <div className="topbarActions">
        <button
          className="themeToggle"
          type="button"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☼" : "☾"}
        </button>
        <button className="notificationButton" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4" />
          </svg>
        </button>
        <details className="accountMenu">
          <summary
            className="accountAvatar"
          >
            <span className="srOnly">Account menu for {userEmail}</span>
            {userEmail.trim().charAt(0).toUpperCase() || "M"}
          </summary>
          <div className="accountMenuPanel">
            <span className="accountMenuEmail" title={userEmail}>
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </details>
      </div>
    </header>
  );
}