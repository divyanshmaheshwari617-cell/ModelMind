
"use client";

import { useEffect, useMemo, useState } from "react";
import { mlLabs } from "../../data/mlLabs";
import "./labs.css";

const categories = [
  "All Models",
  "Regression",
  "Classification",
  "Ensembles",
  "Neural Networks",
  "Unsupervised",
  "Optimization",
];

const STORAGE_KEY = "modelmind-ml-labs-completed-v1";

export default function MLLabsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Models");
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) {
        setCompleted(
  stored.filter(
    (id): id is string =>
      typeof id === "string" &&
      mlLabs.some((lab) => lab.id === id)
  )
);
      }
    } catch {
      setCompleted([]);
    }
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mlLabs.filter((lab) => {
      const matchesCategory =
        category === "All Models" || lab.category === category;
      const matchesSearch =
        !query ||
        `${lab.title} ${lab.category} ${lab.description}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function toggleCompleted(id: string) {
    const next = completed.includes(id)
      ? completed.filter((item) => item !== id)
      : [...completed, id];

    setCompleted(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Browsers with disabled storage still allow session interaction.
    }
  }

  return (
    <main className="ml-labs-page">
      <div className="ml-labs-shell">
        <header className="ml-labs-hero">
          <div>
            <span className="ml-labs-eyebrow">MODELMIND • INTERACTIVE LEARNING</span>
            <h1>ModelMind ML Labs</h1>
            <p>
              Explore machine learning through interactive experiments.
              Choose a model, launch its lab, and track what you have practiced.
            </p>
          </div>
          <span className="ml-labs-count">{mlLabs.length} Labs</span>
        </header>

        <section className="ml-labs-stats" aria-label="Lab statistics">
          <div><strong>{mlLabs.length}</strong><span>Deployed labs</span></div>
          <div><strong>{categories.length - 1}</strong><span>Categories</span></div>
          <div>
            <strong>{ready ? completed.length : "—"}</strong>
            <span>Marked complete</span>
          </div>
        </section>

        <div className="ml-labs-controls">
          <input
            aria-label="Search ML labs"
            type="search"
            placeholder="Search models, algorithms, concepts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="ml-labs-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "selected" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-labs-results">
          Showing {filtered.length} of {mlLabs.length} labs
        </div>

        <section className="ml-labs-grid">
          {filtered.map((lab, index) => {
            const isComplete = completed.includes(lab.id);

            return (
              <article className="ml-labs-card" key={lab.id}>
                <div className={`ml-labs-card-art ml-labs-art-${lab.category.toLowerCase().replaceAll(" ", "-")}`}>
                  <span className="ml-labs-art-label">ML / {String(index + 1).padStart(2, "0")}</span>
                  <div className="ml-labs-art-graphic" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                  </div>
                  <span className="ml-labs-art-footer">INTERACTIVE MODEL EXPLORER</span>
                </div>

                <div className="ml-labs-card-body">
                  <span className="ml-labs-category">{lab.category}</span>
                  <h2>{lab.title}</h2>
                  <p>{lab.description}</p>
                  <span className="ml-labs-interactive">● Interactive lab</span>

                  <a
                    className="ml-labs-open"
                    href={lab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Lab <span aria-hidden="true">↗</span>
                  </a>

                  <button
                    className={`ml-labs-complete ${isComplete ? "is-complete" : ""}`}
                    type="button"
                    onClick={() => toggleCompleted(lab.id)}
                  >
                    {isComplete ? "✓ Completed — undo" : "○ Mark lab complete"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {filtered.length === 0 && (
          <p className="ml-labs-empty">
            No matching labs. Try a different model name or category.
          </p>
        )}

        <p className="ml-labs-note">
          Labs hosted on Render may need time to wake up after inactivity.
          Completion is recorded manually in this browser.
        </p>
      </div>
    </main>
  );
}
