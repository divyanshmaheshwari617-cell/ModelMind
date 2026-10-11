"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  PersonalizedRoadmapData,
  RoadmapProfile,
} from "../../types/roadmap";

import type {
  RoadmapAssessmentResult,
} from "../../lib/roadmap/roadmapAssessment";

import {
  generatePersonalizedRoadmap,
} from "../../lib/roadmap/roadmapGenerator";

import {
  clearRoadmapStorage,
  loadRoadmap,
  saveRoadmap,
  saveRoadmapProfile,
} from "../../lib/roadmap/roadmapPersistence";

import RoadmapOnboarding from "./RoadmapOnboarding";
import RoadmapAssessment from "./RoadmapAssessment";
import PersonalizedRoadmap from "./PersonalizedRoadmap";
import Link from "next/link";
import { mlLabs } from "../../data/mlLabs";


type DashboardStage =
  | "loading"
  | "onboarding"
  | "assessment"
  | "roadmap";


export default function RoadmapDashboard() {
  const [stage, setStage] =
    useState<DashboardStage>("loading");

  const [profile, setProfile] =
    useState<RoadmapProfile | null>(null);

  const [roadmap, setRoadmap] =
    useState<PersonalizedRoadmapData | null>(
      null
    );

  const [
    generatedFromAssessment,
    setGeneratedFromAssessment,
  ] = useState(false);


  // =======================================================
  // RESTORE SAVED ROADMAP
  // =======================================================

  useEffect(() => {
    const savedRoadmap =
      loadRoadmap();

    if (savedRoadmap) {
      setRoadmap(savedRoadmap);
      setProfile(savedRoadmap.profile);
      setGeneratedFromAssessment(false);
      setStage("roadmap");

      return;
    }

    setStage("onboarding");
  }, []);


  // =======================================================
  // ONBOARDING
  // =======================================================

  function handleProfileComplete(
    completedProfile: RoadmapProfile
  ) {
    setProfile(completedProfile);

    saveRoadmapProfile(
      completedProfile
    );

    setRoadmap(null);
    setGeneratedFromAssessment(false);

    setStage("assessment");
  }


  // =======================================================
  // ASSESSMENT
  // =======================================================

  function handleAssessmentComplete(
    result: RoadmapAssessmentResult
  ) {
    if (!profile) {
      return;
    }

    const generated =
      generatePersonalizedRoadmap({
        profile,

        strongSkillIds:
          result.strongSkillIds,

        weakSkillIds:
          result.weakSkillIds,
      });

    const generatedRoadmap =
      generated.roadmap;

    setRoadmap(
      generatedRoadmap
    );

    saveRoadmap(
      generatedRoadmap
    );

    setGeneratedFromAssessment(true);

    setStage("roadmap");
  }


  function handleAssessmentBack() {
    setStage("onboarding");
  }


  // =======================================================
  // ROADMAP UPDATES
  // =======================================================

  function handleRoadmapChange(
    updatedRoadmap: PersonalizedRoadmapData
  ) {
    /*
     * Keep React state and local persistence synchronized.
     *
     * Every Learn / Visualize / Code / Practice update,
     * assignment result, quiz result and completed day
     * eventually reaches this function.
     */

    setRoadmap(
      updatedRoadmap
    );

    saveRoadmap(
      updatedRoadmap
    );
  }


  // =======================================================
  // CREATE NEW ROADMAP
  // =======================================================

  function restartRoadmap() {
    clearRoadmapStorage();

    setProfile(null);
    setRoadmap(null);

    setGeneratedFromAssessment(false);

    setStage("onboarding");
  }


  // =======================================================
  // LOADING
  // =======================================================

  if (stage === "loading") {
    return (
      <section className="roadmap-empty">
        <p className="roadmap-dashboard-label">
          MODELMIND
        </p>

        <h2>
          Loading your roadmap...
        </h2>

        <p>
          Restoring your personalized
          learning progress.
        </p>
      </section>
    );
  }


  // =======================================================
  // ONBOARDING
  // =======================================================

  if (stage === "onboarding") {
    return (
      <RoadmapOnboarding
        onComplete={
          handleProfileComplete
        }
      />
    );
  }


  // =======================================================
  // ASSESSMENT
  // =======================================================

  if (
    stage === "assessment" &&
    profile
  ) {
    return (
      <RoadmapAssessment
        level={
          profile.level
        }
        onComplete={
          handleAssessmentComplete
        }
        onBack={
          handleAssessmentBack
        }
      />
    );
  }


  // =======================================================
  // ROADMAP
  // =======================================================

  if (
    stage === "roadmap" &&
    roadmap
  ) {
    return (
      <main className="roadmap-dashboard">
        <header className="roadmap-dashboard-toolbar">
          <div>
            <p className="roadmap-dashboard-label">
              YOUR PERSONALIZED PATH
            </p>

            <h1 className="roadmap-dashboard-title">
              {roadmap.name}
            </h1>

            <p className="roadmap-dashboard-subtitle">
              Your learning path adapts
              to your level, goals and
              progress while keeping every
              roadmap day available.
            </p>

            {generatedFromAssessment && (
              <p className="roadmap-dashboard-assessment">
                Personalized using your
                diagnostic assessment.
              </p>
            )}
          </div>

          <button
            type="button"
            className="roadmap-secondary-button"
            onClick={
              restartRoadmap
            }
          >
            Create New Roadmap
          </button>
        </header>

<section className="roadmap-labs-banner">
  <div className="roadmap-labs-banner-content">
    <span className="roadmap-labs-eyebrow">
      INTERACTIVE LEARNING EXPERIENCE
    </span>

    <h2>Explore ModelMind ML Labs</h2>

    <p>
      Learn machine learning by experimenting with real
      interactive model visualizations. Explore regression,
      classification, ensemble learning, neural networks,
      clustering, dimensionality reduction and optimization.
    </p>

    <div className="roadmap-labs-banner-meta">
      <span>◈ {mlLabs.length} Interactive Labs</span>
      <span>◈ Model-Specific Visualizations</span>
      <span>◈ Hands-On Learning</span>
    </div>

    <Link href="/labs" className="roadmap-labs-banner-button">
      Explore All ML Labs
      <span aria-hidden="true">↗</span>
    </Link>
  </div>

  <div className="roadmap-labs-banner-visual" aria-hidden="true">
    <div className="roadmap-labs-orbit orbit-one" />
    <div className="roadmap-labs-orbit orbit-two" />
    <div className="roadmap-labs-orbit orbit-three" />
    <div className="roadmap-labs-orbit-center">ML</div>
  </div>
</section>


        <PersonalizedRoadmap
          roadmap={
            roadmap
          }
          onRoadmapChange={
            handleRoadmapChange
          }
        />
      </main>
    );
  }


  // =======================================================
  // FALLBACK
  // =======================================================

  return (
    <section className="roadmap-empty">
      <p className="roadmap-dashboard-label">
        MODELMIND
      </p>

      <h2>
        Unable to load roadmap
      </h2>

      <p>
        Start again to create a new
        personalized learning path.
      </p>

      <button
        type="button"
        className="roadmap-primary-button"
        onClick={
          restartRoadmap
        }
      >
        Start Again
      </button>
    </section>
  );
}