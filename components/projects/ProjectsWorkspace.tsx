"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface ProjectRecord {
  id: string;
  name: string;
  updated_at: string;
}

async function queryProjects() {
  const response = await fetch("/api/projects");
  const result = (await response.json()) as {
    projects?: ProjectRecord[];
    error?: string;
  };
  return {
    projects: result.projects ?? [],
    error: response.ok ? null : new Error(result.error ?? "Could not load projects."),
  };
}

export default function ProjectsWorkspace() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void queryProjects().then(({ projects: rows, error: queryError }) => {
      if (!active) {
        return;
      }
      if (queryError) {
        setError(`Could not load projects: ${queryError.message}`);
      } else {
        setProjects(rows);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) {
      return;
    }

    setSaving(true);
    setError("");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(`Could not save this project: ${result.error ?? "Request failed."}`);
      setSaving(false);
      return;
    }

    setProjectName("");
    const { projects: rows, error: queryError } = await queryProjects();
    if (queryError) {
      setError(`Project saved, but the list could not refresh: ${queryError.message}`);
    } else {
      setProjects(rows);
    }
    setSaving(false);
  }

  return (
    <main className="referencePage">
      <section className="referencePanel projectsWorkspace">
        <header className="projectsHeading">
          <div>
            <span className="referenceHeadingIcon" aria-hidden="true">▱</span>
            <div>
              <h1>Your projects</h1>
              <p>Create and keep project records in your ModelMind account.</p>
            </div>
          </div>
          <span className="projectsPrivacy">Private to your account</span>
        </header>

        <form className="projectsCreateForm" onSubmit={createProject}>
          <label className="srOnly" htmlFor="new-project-name">Project name</label>
          <input
            id="new-project-name"
            maxLength={120}
            required
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="For example, Customer Churn Analysis"
          />
          <button type="submit" disabled={saving || !projectName.trim()}>
            {saving ? "Saving…" : "Create project"}
          </button>
        </form>

        {error && <p className="projectsMessage projectsError" role="alert">{error}</p>}
        {loading ? (
          <p className="projectsMessage" role="status">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="projectsEmptyState">
            <span aria-hidden="true">✦</span>
            <h2>No projects yet</h2>
            <p>Create your first project above. Your project records are saved to your Supabase account.</p>
          </div>
        ) : (
          <ul className="projectsList">
            {projects.map((project) => (
              <li key={project.id}>
                <span className="projectListIcon" aria-hidden="true">▱</span>
                <span>
                  <strong>{project.name}</strong>
                  <small>Updated {new Date(project.updated_at).toLocaleDateString()}</small>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="projectsFootnote">
          Project names and metadata are stored in Supabase. Jupyter notebook files and runtime are not yet cloud-synced.
        </p>
      </section>
    </main>
  );
}
