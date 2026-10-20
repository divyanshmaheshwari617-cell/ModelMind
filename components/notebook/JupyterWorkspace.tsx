"use client";

import OpenJupyterForm from "@/components/notebook/OpenJupyterForm";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export default function JupyterWorkspace() {
  return (
    <main className="portalPage jupyterWorkspace">
      <section className="portalHero">
        <span className="portalEyebrow">YOUR LOCAL NOTEBOOK ENVIRONMENT</span>
        <h1>Your notebooks, running in JupyterLab.</h1>
        <p>
          This opens the real local JupyterLab server—not a separate dashboard
          notebook demo. Your ModelMind extension provides Error Assistant,
          AI Chat, preprocessing tools, and ML Studio inside JupyterLab.
        </p>
        <OpenJupyterForm className="jupyterLaunchButton">
          Open ModelMind JupyterLab <span aria-hidden="true">↗</span>
        </OpenJupyterForm>
        <p className="jupyterLocalAddress">
          Local companion: <code>{API_URL}</code>
        </p>
      </section>

      <section className="jupyterNotebooks">
        <div className="portalSectionHeading">
          <span className="portalEyebrow">SAVED ON THIS COMPUTER</span>
          <h2>Your notebooks stay on this computer</h2>
          <p>
            Open JupyterLab to browse and create notebooks in your local
            workspace. Your files are not uploaded to ModelMind or Render.
          </p>
        </div>
        <p className="jupyterLocalAddress">
          If the companion is not running, start it from the project folder
          with <code>npm run companion</code> and keep its terminal open.
        </p>
      </section>
    </main>
  );
}
