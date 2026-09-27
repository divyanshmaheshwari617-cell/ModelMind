"use client";

export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">
          Workspace <span>/</span> Notebook
        </div>

        <h2>Untitled ML Project</h2>
      </div>

      <div className="topbarActions">
        <div className="runtimeStatus">
          <span className="statusDot"></span>
          Runtime ready
        </div>

        <button className="secondaryButton">
          Share
        </button>

        <button className="upgradeButton">
          Upgrade
        </button>

        <div className="avatar">D</div>
      </div>
    </header>
  );
}