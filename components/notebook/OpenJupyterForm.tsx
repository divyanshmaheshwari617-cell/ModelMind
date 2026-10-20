"use client";

import { useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function OpenJupyterForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);

  async function openNotebook() {
    setError("");
    const notebookWindow = window.open("about:blank", "_blank");
    if (!notebookWindow) {
      setError("Allow pop-ups for this site, then choose Open Notebook again.");
      return;
    }
    notebookWindow.opener = null;
    setOpening(true);

    try {
      const response = await fetch(`${API_URL}/jupyter/prepare`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const result = (await response.json()) as {
        detail?: string;
        launch_id?: string;
      };
      if (!response.ok || !result.launch_id) {
        throw new Error(
          result.detail ?? "Could not connect to the local notebook companion.",
        );
      }

      notebookWindow.location.href =
        `${API_URL}/jupyter/open?launch_id=${encodeURIComponent(result.launch_id)}`;
    } catch (cause) {
      notebookWindow.close();
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not open the local notebook. Check that the companion is running.",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <>
      <button
        className={className}
        disabled={opening}
        onClick={openNotebook}
        type="button"
      >
        {opening ? "Connecting..." : children}
      </button>
      {error && (
        <p className="jupyterLaunchError" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
