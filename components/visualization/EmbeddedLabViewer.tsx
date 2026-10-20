"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, RotateCw, X } from "lucide-react";
import type { VisualizationItem } from "@/lib/visualizations";

interface EmbeddedLabViewerProps {
  lab: VisualizationItem | null;
  onClose: () => void;
}

export default function EmbeddedLabViewer({
  lab,
  onClose,
}: EmbeddedLabViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (lab) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lab, onClose]);

  if (!lab || !lab.href) {
    return null;
  }

  return (
    <div
      className={`mm-lab-overlay ${isFullscreen ? "fullscreen" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={lab.name}
    >
      <div className="mm-lab-container">
        <header className="mm-lab-header">
          <div className="mm-lab-header-left">
            <button
              type="button"
              className="mm-lab-back-btn"
              onClick={onClose}
              title="Close lab and return to ModelMind"
            >
              <ArrowLeft size={16} />
              <span>Back to ModelMind</span>
            </button>
            <div className="mm-lab-divider" aria-hidden="true" />
            <div className="mm-lab-title-group">
              <span className="mm-lab-badge">PROTECTED LAB</span>
              <h2 className="mm-lab-title">{lab.name}</h2>
            </div>
          </div>

          <div className="mm-lab-header-right">
            <button
              type="button"
              className="mm-lab-icon-btn"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Reload lab"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              className="mm-lab-icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              className="mm-lab-close-btn"
              onClick={onClose}
              title="Close lab"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="mm-lab-body">
          <iframe
            key={iframeKey}
            src={lab.href}
            title={lab.name}
            className="mm-lab-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}
