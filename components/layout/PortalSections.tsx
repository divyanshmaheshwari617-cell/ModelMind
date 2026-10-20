"use client";

import { useState } from "react";

import ProjectsWorkspace from "@/components/projects/ProjectsWorkspace";
import OpenJupyterForm from "@/components/notebook/OpenJupyterForm";
import { visualizations } from "@/lib/visualizations";
import type { Workspace } from "./Sidebar";

const ROADMAP_URL =
  "https://modelmind-personalized.divyanshmaheshwari617.workers.dev/";
const VIDEOGPT_URL = "https://video-analysis-amber-pi.vercel.app/";

const roadmaps = [
  {
    name: "Data Science",
    description: "From basics to advanced ML pipelines.",
    count: "50+ topics",
    icon: "▥",
    color: "orange",
  },
  {
    name: "Machine Learning",
    description: "Learn core ML algorithms with hands-on practice.",
    count: "60+ topics",
    icon: "♧",
    color: "purple",
  },
  {
    name: "Deep Learning",
    description: "Neural networks, CNNs, RNNs and more.",
    count: "45+ topics",
    icon: "✣",
    color: "blue",
  },
  {
    name: "Generative AI",
    description: "LLMs, prompt engineering and real-world projects.",
    count: "35+ topics",
    icon: "✦",
    color: "yellow",
  },
  {
    name: "Full Stack Development",
    description: "Build modern web apps from scratch.",
    count: "40+ topics",
    icon: "▱",
    color: "green",
  },
  {
    name: "Cyber Security",
    description: "Learn security concepts and practical tools.",
    count: "30+ topics",
    icon: "⬡",
    color: "lime",
  },
  {
    name: "Cloud Computing",
    description: "AWS, deployment and cloud fundamentals.",
    count: "35+ topics",
    icon: "☁",
    color: "blue",
  },
  {
    name: "Interview Preparation",
    description: "Company-wise questions and practice sets.",
    count: "100+ questions",
    icon: "▤",
    color: "pink",
  },
];

interface PortalSectionsProps {
  section:
    | "Dashboard"
    | "Roadmap"
    | "Notebook"
    | "Visualizations"
    | "VideoGPT"
    | "Datasets"
    | "Projects"
    | "Community"
    | "Documentation";
  onWorkspaceChange: (workspace: Workspace) => void;
  userEmail: string;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function SectionHeading({
  icon,
  title,
  description,
  tone,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
  action?: React.ReactNode;
}) {
  return (
    <header className={`referenceHeading ${tone}`}>
      <span className="referenceHeadingIcon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="referenceHeadingAction">{action}</div>}
    </header>
  );
}

function NotebookPreview() {
  const files = [
    "notebook.ipynb",
    "data.csv",
    "model.py",
    "visualization.ipynb",
    "requirements.txt",
  ];

  return (
    <div className="referenceNotebookEditor" aria-label="Notebook preview">
      <div className="referenceNotebookMenu">
        <span>File</span><span>Edit</span><span>View</span><span>Run</span>
        <span>Kernel</span><span>Help</span>
        <span className="referenceRunAll">▶ Run All</span>
        <span className="referenceKernel">Python 3⌄</span>
      </div>
      <div className="referenceNotebookBody">
        <div className="referenceFiles" aria-label="Notebook files">
          {files.map((file, index) => (
            <span className={index === 0 ? "selected" : ""} key={file}>
              <span aria-hidden="true">♧</span>{file}
            </span>
          ))}
        </div>
        <div className="referenceCode">
          <div className="referenceCodeLine"><i>1</i><code><b>import</b> pandas <b>as</b> pd</code></div>
          <div className="referenceCodeLine"><i>2</i><code><b>import</b> matplotlib.pyplot <b>as</b> plt</code></div>
          <div className="referenceCodeLine referenceCodeBlank"><i>3</i><code /></div>
          <div className="referenceCodeLine"><i>4</i><code><em># Load dataset</em></code></div>
          <div className="referenceCodeLine"><i>5</i><code>df = pd.read_csv(<em>&apos;data.csv&apos;</em>)</code></div>
          <div className="referenceCodeLine"><i>6</i><code>df.head()</code></div>
          <div className="referenceDataTable">
            <table>
              <thead><tr><th></th><th>age</th><th>salary</th><th>experience</th><th>department</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>25</td><td>50000</td><td>2</td><td>IT</td></tr>
                <tr><td>1</td><td>28</td><td>62000</td><td>5</td><td>HR</td></tr>
                <tr><td>2</td><td>32</td><td>75000</td><td>8</td><td>Marketing</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VisualizationIllustration({ kind }: { kind: string }) {
  if (kind === "tree") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 100 82" aria-hidden="true">
        <g className="treeBranches"><path d="M50 17 29 39M50 17l21 22M29 39 17 62M29 39l12 23M71 39 59 62M71 39l12 23" /></g>
        <rect x="42" y="8" width="16" height="13" rx="4" className="treeRoot" />
        <rect x="21" y="33" width="16" height="13" rx="4" className="treeNode" />
        <rect x="63" y="33" width="16" height="13" rx="4" className="treeRoot" />
        <circle cx="17" cy="66" r="6" className="treeNode" />
        <circle cx="41" cy="66" r="6" className="treeLeaf" />
        <circle cx="59" cy="66" r="6" className="treeNode" />
        <circle cx="83" cy="66" r="6" className="treeLeaf" />
      </svg>
    );
  }
  if (kind === "bars") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <text x="31" y="11">Feature Importance</text>
        {[70, 53, 39, 29, 20, 13].map((width, index) => (
          <g key={width}><text x="0" y={23 + index * 9}>feature{index + 1}</text><rect x="35" y={15 + index * 9} width={width} height="7" rx="1" /></g>
        ))}
      </svg>
    );
  }
  if (kind === "lines") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <path className="chartAxis" d="M8 8v62h94" />
        <path className="chartRed" d="M12 65c22-3 28-14 44-22s25-19 43-32" />
        <path className="chartBlue" d="M12 68c22-2 32-8 48-16s22-13 39-20" />
      </svg>
    );
  }
  if (kind === "network") {
    return (
      <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
        <g className="networkEdges">
          <path d="M14 22 43 13M14 22 43 39M14 22 43 64M14 41 43 13M14 41 43 39M14 41 43 64M14 60 43 13M14 60 43 39M14 60 43 64M43 13 72 22M43 13 72 60M43 39 72 22M43 39 72 60M43 64 72 22M43 64 72 60M72 22 98 41M72 60 98 41" />
        </g>
        {[ [14,22],[14,41],[14,60],[43,13],[43,39],[43,64],[72,22],[72,60],[98,41] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
        ))}
      </svg>
    );
  }
  const clusters = kind === "clusters"
    ? [[26, 45, "#3b82f6"], [53, 25, "#ef4444"], [80, 47, "#16a36a"]]
    : [[28, 42, "#8b5cf6"], [72, 26, "#16a36a"]];
  return (
    <svg className="referenceVisualizationArt" viewBox="0 0 110 82" aria-hidden="true">
      <path className="chartAxis" d="M8 8v62h94" />
      {clusters.flatMap(([cx, cy, color], clusterIndex) =>
        Array.from({ length: kind === "clusters" ? 11 : 15 }, (_, pointIndex) => {
          const angle = pointIndex * 2.4 + clusterIndex;
          const spread = 4 + (pointIndex % 4) * 2.6;
          const pointX = Math.round((Number(cx) + Math.cos(angle) * spread) * 1000) / 1000;
          const pointY = Math.round((Number(cy) + Math.sin(angle) * spread) * 1000) / 1000;
          return <circle key={`${clusterIndex}-${pointIndex}`} cx={pointX} cy={pointY} r="1.8" fill={color as string} />;
        }),
      )}
    </svg>
  );
}

export default function PortalSections({
  section,
  onWorkspaceChange,
  userEmail,
}: PortalSectionsProps) {
  if (section === "Roadmap") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceRoadmap">
          <SectionHeading
            tone="roadmap"
            icon="◴"
            title="Roadmaps"
            description="Structured learning paths to master in-demand skills from basics to advanced."
            action={<ExternalLink className="referenceViewAll" href={ROADMAP_URL}>View All <ArrowIcon /></ExternalLink>}
          />
          <div className="referenceRoadmapGrid">
            {roadmaps.map((roadmap) => (
              <ExternalLink className={`referenceRoadmapCard ${roadmap.color}`} href={ROADMAP_URL} key={roadmap.name}>
                <span className="referenceRoadmapIcon" aria-hidden="true">{roadmap.icon}</span>
                <span className="referenceRoadmapCopy"><strong>{roadmap.name}</strong><small>{roadmap.description}</small></span>
                <span className="referenceRoadmapFooter"><small>{roadmap.count}</small><i aria-hidden="true"><ArrowIcon /></i></span>
              </ExternalLink>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (section === "Notebook") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceNotebook">
          <SectionHeading
            tone="notebook"
            icon={<span className="referenceCodeIcon">&lt;/&gt;</span>}
            title="Notebook"
            description="Write, run and experiment with Python right in your browser."
            action={
              <OpenJupyterForm className="referencePrimaryLink">
                Open Notebook <ArrowIcon />
              </OpenJupyterForm>
            }
          />
          <div className="referenceNotebookGrid">
            <NotebookPreview />
            <div className="referenceNotebookFeatures">
              <div><span className="featureCube">⬡</span><span><strong>Pre-installed Libraries</strong><small>Pandas, NumPy, Matplotlib, Scikit-learn and more.</small></span></div>
              <div><span className="featureUpload">↑</span><span><strong>Upload Your Data</strong><small>Work with your own datasets instantly.</small></span></div>
              <div><span className="featureShare">↗</span><span><strong>Save &amp; Share Notebooks</strong><small>Keep your work and share with others.</small></span></div>
              <div><span className="featureAssistant">✦</span><span><strong>AI Error Assistant</strong><small>Get instant help for errors and explanations.</small></span></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (section === "VideoGPT") {
    return <VideoGPT />;
  }

  if (section === "Visualizations") {
    return (
      <main className="referencePage">
        <section className="referencePanel referenceVisualizations">
          <SectionHeading
            tone="visualizations"
            icon={<span className="referenceBarsIcon">▮</span>}
            title="Visualizations"
            description="Explore interactive visualizations for popular machine learning algorithms."
            action={<a className="referenceViewAll" href="/visualizations">View All <ArrowIcon /></a>}
          />
          <div className="referenceVisualizationGrid">
            {visualizations.slice(0, 7).map((item) =>
              item.href ? (
                <ExternalLink className="referenceVisualizationCard" href={item.href} key={item.name}>
                  <strong>{item.name}</strong>
                  <VisualizationIllustration kind={item.kind} />
                  <i aria-hidden="true"><ArrowIcon /></i>
                </ExternalLink>
              ) : (
                <div
                  aria-disabled="true"
                  className="referenceVisualizationCard referenceVisualizationUnavailable"
                  key={item.name}
                >
                  <strong>{item.name}</strong>
                  <VisualizationIllustration kind={item.kind} />
                  <span>Coming soon</span>
                </div>
              ),
            )}
          </div>
        </section>
      </main>
    );
  }

  if (section === "Projects") {
    return <ProjectsWorkspace />;
  }

  if (section === "Datasets" || section === "Community" || section === "Documentation") {
    const descriptions: Record<string, string> = {
      Datasets: "Organize and explore datasets for your machine-learning projects.",
      Community: "Connect with other learners and share what you build.",
      Documentation: "Guides and references to help you get the most out of ModelMind.",
    };
    return (
      <main className="referencePage">
        <section className="referencePanel referenceComingSoon">
          <span className="referenceComingSoonIcon">✦</span>
          <h1>{section}</h1>
          <p>{descriptions[section]}</p>
        </section>
      </main>
    );
  }

  return (
    <DashboardHome
      onWorkspaceChange={onWorkspaceChange}
      userEmail={userEmail}
    />
  );
}

function VideoGPT() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("Explain Concept");
  return (
    <main className="referencePage">
      <section className="referencePanel referenceVideo">
        <SectionHeading
          tone="video"
          icon="▶"
          title="VideoGPT"
          description="Turn your questions into easy-to-understand video explanations."
          action={<ExternalLink className="referenceViewAll" href={VIDEOGPT_URL}>Try VideoGPT <ArrowIcon /></ExternalLink>}
        />
        <div className="referenceVideoGrid">
          <div className="referenceVideoPrompt">
            <label className="srOnly" htmlFor="video-prompt">Video topic or question</label>
            <textarea
              id="video-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask anything... (e.g. Explain PCA, How does a decision tree work, etc.)"
            />
            <div>
              <label className="referenceModeLabel" htmlFor="video-mode">▣
                <select id="video-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
                  <option>Explain Concept</option>
                  <option>Summarize a Video</option>
                  <option>Answer a Question</option>
                </select>
              </label>
              <ExternalLink className="referenceGenerateLink" href={VIDEOGPT_URL}>Generate Video <ArrowIcon /></ExternalLink>
            </div>
          </div>
          <ExternalLink className="referenceVideoPreview" href={VIDEOGPT_URL} aria-label="Open VideoGPT">
            <span><b>▶</b></span>
          </ExternalLink>
        </div>
      </section>
    </main>
  );
}

function DashboardHome({
  onWorkspaceChange,
  userEmail,
}: {
  onWorkspaceChange: (workspace: Workspace) => void;
  userEmail: string;
}) {
  const firstName = userEmail.split("@")[0]?.split(/[._-]/)[0] || "Learner";
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <main className="referencePage referenceHome referenceDashboardHome">
      <header className="homeWelcome">
        <div>
          <h1>Welcome back, <span>{displayName}</span> <span aria-hidden="true">👋</span></h1>
          <p>Your AI learning workspace is ready. Keep your momentum going.</p>
        </div>
        <div className="homeWelcomeActions">
          <span className="homeDate"><span aria-hidden="true">✦</span>YOUR WORKSPACE</span>
          <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
            <span aria-hidden="true">＋</span> New Project
          </button>
        </div>
      </header>

      <section className="homeMetricGrid" aria-label="Your learning workspace">
        <button type="button" onClick={() => onWorkspaceChange("Roadmap")}>
          <span className="homeMetricIcon metricPurple">♧</span>
          <span><strong>Learning paths</strong><b>8</b><small>Guided roadmaps to explore</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
          <span className="homeMetricIcon metricOrange">▤</span>
          <span><strong>Datasets</strong><b>Ready for yours</b><small>Upload data in your notebook</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Visualizations")}>
          <span className="homeMetricIcon metricGreen">▥</span>
          <span><strong>Visualizations</strong><b>7 featured labs</b><small>Explore popular algorithms</small></span>
          <span className="metricArrow">›</span>
        </button>
        <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
          <span className="homeMetricIcon metricBlue">▱</span>
          <span><strong>Projects</strong><b>Your next idea</b><small>Start building in a notebook</small></span>
          <span className="metricArrow">›</span>
        </button>
      </section>

      <section className="homeMiddleGrid">
        <div className="homeContentCard homeRecentCard">
          <HomeSectionHeading icon="◷" title="Suggested next steps" action="Explore" onClick={() => onWorkspaceChange("Roadmap")} />
          <div className="homeRecentList">
            <button type="button" onClick={() => onWorkspaceChange("Roadmap")}>
              <span className="recentIcon recentPurple">◫</span>
              <span className="recentCopy"><strong>Machine Learning Roadmap</strong><small>Recommended path · Learn at your pace</small></span>
              <span className="recentAction">Continue <ArrowIcon /></span>
            </button>
            <button type="button" onClick={() => onWorkspaceChange("Notebook")}>
              <span className="recentIcon recentOrange">▤</span>
              <span className="recentCopy"><strong>Start a notebook</strong><small>Write and run your first Python cells</small></span>
              <span className="recentAction">Open <ArrowIcon /></span>
            </button>
            <button type="button" onClick={() => onWorkspaceChange("Visualizations")}>
              <span className="recentIcon recentGreen">⬡</span>
              <span className="recentCopy"><strong>Explore model visualizations</strong><small>PCA · Clustering · Decision trees</small></span>
              <span className="recentStatus"><i /> Ready</span>
              <span className="recentAction">Open <ArrowIcon /></span>
            </button>
          </div>
        </div>

        <div className="homeContentCard homeQuickCard">
          <HomeSectionHeading icon="ϟ" title="Quick launch" action="View all" onClick={() => onWorkspaceChange("Notebook")} />
          <div className="quickLaunchGrid">
            <QuickLaunch icon="</>" tone="purple" title="Open Notebook" description="Write, run and experiment with Python." onClick={() => onWorkspaceChange("Notebook")} />
            <QuickLaunch icon="♧" tone="orange" title="Explore Algorithms" description="Visualize popular ML algorithms." onClick={() => onWorkspaceChange("Visualizations")} />
            <QuickLaunch icon="▤" tone="green" title="Browse Datasets" description="Bring your own data to a notebook." onClick={() => onWorkspaceChange("Notebook")} />
            <QuickLaunch icon="▷" tone="purple" title="Ask VideoGPT" description="Turn questions into clear explanations." onClick={() => onWorkspaceChange("VideoGPT")} />
          </div>
        </div>
      </section>

      <section className="homeBottomGrid">
        <div className="homeContentCard homeExploreCard">
          <HomeSectionHeading icon="▥" title="Explore visualizations" description="Interactive visualizations for popular machine-learning algorithms." action="View all" onClick={() => onWorkspaceChange("Visualizations")} />
          <div className="homeVisualizationGrid">
            {visualizations.filter((item): item is typeof item & { href: string } => Boolean(item.href)).slice(0, 4).map((item) => (
              <ExternalLink className="homeVisualizationTile" href={item.href} key={item.name}>
                <strong>{item.name}</strong>
                <VisualizationIllustration kind={item.kind} />
                <i aria-hidden="true"><ArrowIcon /></i>
              </ExternalLink>
            ))}
          </div>
        </div>
        <div className="homeContentCard homeVideoCard">
          <HomeSectionHeading icon="▶" title="VideoGPT spotlight" action="View all" onClick={() => onWorkspaceChange("VideoGPT")} />
          <div className="videoSpotlight">
            <div className="videoSpotlightCopy">
              <strong>Make complex AI concepts click.</strong>
              <p>Get clear, visual explanations with VideoGPT.</p>
              <div><span>Explain PCA in 60 seconds</span><span>How does a decision tree work?</span></div>
              <ExternalLink href={VIDEOGPT_URL}>Try VideoGPT <ArrowIcon /></ExternalLink>
            </div>
            <ExternalLink className="videoSpotlightScreen" href={VIDEOGPT_URL} aria-label="Open VideoGPT">
              <span>▶</span><i>✦</i>
            </ExternalLink>
          </div>
        </div>
      </section>

      <section className="homeContentCard homeLearningPaths">
        <HomeSectionHeading icon="♧" title="Choose your learning path" description="Explore a guided roadmap and find your next topic." action="All roadmaps" onClick={() => onWorkspaceChange("Roadmap")} />
        <div className="homeLearningPathGrid">
          {roadmaps.slice(0, 4).map((roadmap) => (
            <button type="button" key={roadmap.name} onClick={() => onWorkspaceChange("Roadmap")}>
              <span className={`learningPathIcon ${roadmap.color}`}>{roadmap.icon}</span>
              <span className="learningPathCopy">
                <strong>{roadmap.name}</strong>
                <small>{roadmap.description}</small>
                <b>{roadmap.count}</b>
              </span>
              <span className="metricArrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function HomeSectionHeading({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: string;
  title: string;
  description?: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <header className="homeSectionHeading">
      <span aria-hidden="true">{icon}</span>
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <button type="button" onClick={onClick}>{action}<ArrowIcon /></button>
    </header>
  );
}

function QuickLaunch({
  icon,
  tone,
  title,
  description,
  onClick,
}: {
  icon: string;
  tone: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="quickLaunchTile" type="button" onClick={onClick}>
      <span className={`quickLaunchIcon ${tone}`}>{icon}</span>
      <span><strong>{title}</strong><small>{description}</small></span>
      <span className="quickLaunchArrow">›</span>
    </button>
  );
}
