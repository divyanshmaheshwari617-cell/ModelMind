
"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronRight,
  Compass,
  FlaskConical,
  Menu,
  Network,
  X,
} from "lucide-react";

const sections = [
  { id: "journey", label: "Learning Path", icon: Compass },
  { id: "learn", label: "Foundations", icon: BookOpen },
  { id: "explore", label: "Concept Explorer", icon: BrainCircuit },
  { id: "compare", label: "Model Comparison", icon: FlaskConical },
  { id: "bias-variance", label: "Bias & Variance", icon: ChartNoAxesCombined },
  { id: "theory", label: "Detailed Theory", icon: Network },
] as const;

export default function EnsembleNavigation() {
  const [active, setActive] = useState<string>("journey");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top,
          );

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  function navigate(id: string) {
    setActive(id);
    setMobileOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      aria-label="Ensemble Learning navigation"
      className="sticky top-0 z-50 -mx-4 border-b border-slate-800 bg-[#090f1d]/95 px-4 py-3 shadow-xl backdrop-blur-xl md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <BrainCircuit size={19} className="text-violet-300" />
          <span className="text-sm font-bold tracking-wide text-white">
            ModelMind
          </span>
          <ChevronRight size={14} className="text-slate-500" />
          <span className="hidden text-xs text-slate-300 sm:inline">
            Ensemble Learning
          </span>
        </div>

        <div className="hidden min-w-0 items-center gap-1 overflow-x-auto xl:flex">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              aria-current={active === id ? "location" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active === id
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="rounded-xl border border-slate-700 p-2 text-slate-200 xl:hidden"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mt-3 grid gap-2 border-t border-slate-800 pt-3 sm:grid-cols-2 xl:hidden">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
                active === id
                  ? "bg-violet-600 text-white"
                  : "bg-slate-900 text-slate-300"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
