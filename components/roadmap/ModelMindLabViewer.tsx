
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import type { CSSProperties } from "react";

interface ModelMindLabViewerProps {
  title: string;
  url: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export default function ModelMindLabViewer({
  title,
  url,
  label = "Open Lab",
  className,
  style,
}: ModelMindLabViewerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Portals require a browser document.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scrolling while lab is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      triggerRef.current?.focus();
    };
  }, [open]);

  function openLab() {
    setOpen(true);
  }

  function closeLab() {
    setOpen(false);
  }

  const viewer = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} - ModelMind Interactive Lab`}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,

        width: "100vw",
        height: "100dvh",

        zIndex: 2147483647,

        background: "#081225",

        display: "flex",
        flexDirection: "column",

        padding: 0,
        margin: 0,

        overflow: "hidden",
        borderRadius: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Full-width ModelMind header */}
      <div
        style={{
          height: 64,
          minHeight: 64,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          gap: 12,
          padding: "0 20px",

          background: "#0c1930",
          borderBottom: "1px solid #243752",

          color: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 37,
              height: 37,

              borderRadius: 10,

              background: "#4059d9",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#ffffff",
              fontSize: 21,
              fontWeight: 800,

              flexShrink: 0,
            }}
          >
            M
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1.8,
                color: "#8ddfd3",
                fontWeight: 800,
              }}
            >
              MODELMIND INTERACTIVE LAB
            </div>

            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#ffffff",

                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
          </div>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={closeLab}
          aria-label={`Close ${title} and return to ModelMind`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: "10px 18px",
            gap: 8,

            border: "1px solid #405474",
            borderRadius: 10,

            background: "#172943",
            color: "#ffffff",

            fontWeight: 700,
            fontSize: 14,

            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕ Close Lab
        </button>
      </div>

      {/* Lab fills the entire remaining viewport */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,

          width: "100%",

          overflow: "hidden",
          position: "relative",

          background: "#ffffff",
        }}
      >
        <iframe
          src={url}
          title={`${title} Interactive Visualization`}
          allow="fullscreen"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: "absolute",
            inset: 0,

            display: "block",

            width: "100%",
            height: "100%",

            border: 0,
            padding: 0,
            margin: 0,

            background: "#ffffff",
          }}
        />
      </main>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={openLab}
        style={{
          cursor: "pointer",
          ...style,
        }}
      >
        {label}
      </button>

      {mounted &&
        open &&
        createPortal(viewer, document.body)}
    </>
  );
}
