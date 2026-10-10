
"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Menu,
  Play,
  X,
} from "lucide-react";

const sections = [
  {
    id: "bootstrap",
    label: "Bootstrap Sampling",
    icon: Database,
  },
  {
    id: "training",
    label: "Training & Visualizations",
    icon: Play,
  },
  {
    id: "bias-variance",
    label: "Bias & Variance",
    icon: ChartNoAxesCombined,
  },
  {
    id: "theory",
    label: "Detailed Theory",
    icon: BookOpen,
  },
] as const;

export default function BaggingNavigation() {
  const [active, setActive] = useState<string>("bootstrap");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateActive = () => {
      const offset = 125;
      let current: string = sections[0].id;

      for (const section of sections) {
        const element = document.getElementById(section.id);

        if (
          element &&
          element.getBoundingClientRect().top <= offset
        ) {
          current = section.id;
        }
      }

      setActive(current);
    };

    updateActive();

    window.addEventListener("scroll", updateActive, {
      passive: true,
    });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  function navigate(id: string) {
    setActive(id);
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      aria-label="Bagging Lab navigation"
      className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#080d19]/95 shadow-lg backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={() => navigate("bootstrap")}
          className="flex items-center gap-3 text-left"
        >
          <span className="rounded-xl bg-violet-500/15 p-2.5">
            <BrainCircuit
              size={22}
              className="text-violet-300"
            />
          </span>

          <span>
            <span className="block text-sm font-bold text-white">
              ModelMind
            </span>
            <span className="block text-xs text-violet-300">
              Bagging Lab
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => navigate(section.id)}
                aria-current={
                  active === section.id
                    ? "location"
                    : undefined
                }
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                  active === section.id
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
          aria-controls="bagging-mobile-navigation"
          className="rounded-xl border border-slate-700 p-3 text-slate-200 lg:hidden"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="bagging-mobile-navigation"
          className="mx-auto grid max-w-[1500px] gap-2 border-t border-slate-800 px-4 py-4 sm:grid-cols-2 md:px-8 lg:hidden"
        >
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => navigate(section.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
                  active === section.id
                    ? "bg-violet-600 text-white"
                    : "bg-slate-900 text-slate-300"
                }`}
              >
                <Icon size={17} />
                {section.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
