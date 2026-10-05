"use client";

import { useState } from "react";

import type {
  MLModelDeepDive,
  LessonParameter,
  LessonSection,
} from "../../types/roadmap";
import RoadmapModelParameters
  from "./RoadmapModelParameters";


interface RoadmapModelDeepDiveProps {
  deepDive?: MLModelDeepDive;
  sections?: LessonSection[];
}


type DeepDiveTab =
  | "intuition"
  | "algorithm"
  | "mathematics"
  | "parameters"
  | "behavior"
  | "data"
  | "tuning"
  | "comparison"
  | "applications"
  | "exam";


const TABS: {
  id: DeepDiveTab;
  label: string;
}[] = [
  {
    id: "intuition",
    label: "Intuition",
  },
  {
    id: "algorithm",
    label: "How It Works",
  },
  {
    id: "mathematics",
    label: "Mathematics",
  },
  {
    id: "parameters",
    label: "Parameters",
  },
  {
    id: "behavior",
    label: "Model Behavior",
  },
  {
    id: "data",
    label: "Data & Preprocessing",
  },
  {
    id: "tuning",
    label: "Tuning",
  },
  {
    id: "comparison",
    label: "Comparisons",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "exam",
    label: "Exam & Interview",
  },
];
type SectionTabMap = Record<
  DeepDiveTab,
  LessonSection[]
>;


function createEmptySectionTabMap():
  SectionTabMap {
  return {
    intuition: [],
    algorithm: [],
    mathematics: [],
    parameters: [],
    behavior: [],
    data: [],
    tuning: [],
    comparison: [],
    applications: [],
    exam: [],
  };
}


function normalizeSectionText(
  section: LessonSection
): string {
  return [
    section.id,
    section.title,
  ]
    .join(" ")
    .toLowerCase();
}


function getSectionTab(
  section: LessonSection
): DeepDiveTab {
  const text =
    normalizeSectionText(section);


  // =======================================================
  // EXAM / INTERVIEW
  // =======================================================

  if (
    text.includes("exam") ||
    text.includes("interview") ||
    text.includes("revision") ||
    text.includes("viva")
  ) {
    return "exam";
  }


  // =======================================================
  // APPLICATIONS
  // =======================================================

  if (
    text.includes("application") ||
    text.includes("real-world") ||
    text.includes("real world") ||
    text.includes("use-case") ||
    text.includes("use case")
  ) {
    return "applications";
  }


  // =======================================================
  // COMPARISONS
  // =======================================================

  if (
    text.includes("comparison") ||
    text.includes("compared") ||
    text.includes("-vs-") ||
    text.includes(" vs ") ||
    text.startsWith("vs ")
  ) {
    return "comparison";
  }


  // =======================================================
  // TUNING
  // =======================================================

  if (
    text.includes("tuning") ||
    text.includes("grid-search") ||
    text.includes("grid search") ||
    text.includes("randomized-search") ||
    text.includes("randomized search") ||
    text.includes("hyperparameter-search") ||
    text.includes("hyperparameter search")
  ) {
    return "tuning";
  }


  // =======================================================
  // DATA / PREPROCESSING
  // =======================================================

  if (
    text.includes("scaling") ||
    text.includes("preprocessing") ||
    text.includes("missing") ||
    text.includes("categorical") ||
    text.includes("outlier") ||
    text.includes("imbalance") ||
    text.includes("feature-distribution") ||
    text.includes("feature distribution") ||
    text.includes("dataset-size") ||
    text.includes("dataset size") ||
    text.includes("dimensional")
  ) {
    return "data";
  }


  // =======================================================
  // PARAMETERS
  // =======================================================

  if (
    text.includes("max-depth") ||
    text.includes("max_depth") ||
    text.includes("min-samples") ||
    text.includes("min_samples") ||
    text.includes("max-features") ||
    text.includes("max_features") ||
    text.includes("max-leaf") ||
    text.includes("max_leaf") ||
    text.includes("criterion") ||
    text.includes("splitter") ||
    text.includes("class-weight") ||
    text.includes("class_weight") ||
    text.includes("random-state") ||
    text.includes("random_state") ||
    text.includes("ccp-alpha") ||
    text.includes("ccp_alpha") ||
    text.includes("n-estimators") ||
    text.includes("n_estimators") ||
    text.includes("n-jobs") ||
    text.includes("n_jobs") ||
    text.includes("warm-start") ||
    text.includes("warm_start") ||
    text.includes("bootstrap-parameter") ||
    text.includes("oob-score-parameter") ||
    text.includes("max-samples") ||
    text.includes("max_samples") ||
    text.includes("verbose") ||
    text.includes("monotonic") ||
    text.includes("parameter")
  ) {
    return "parameters";
  }


  // =======================================================
  // MATHEMATICS
  // =======================================================

  if (
    section.mathematics ||
    text.includes("mathemat") ||
    text.includes("formula") ||
    text.includes("equation") ||
    text.includes("gini") ||
    text.includes("entropy") ||
    text.includes("information-gain") ||
    text.includes("information gain") ||
    text.includes("impurity") ||
    text.includes("objective") ||
    text.includes("loss") ||
    text.includes("cost-function") ||
    text.includes("cost function") ||
    text.includes("gradient") ||
    text.includes("probability")
  ) {
    return "mathematics";
  }


  // =======================================================
  // MODEL BEHAVIOR
  // =======================================================

  if (
    text.includes("bias-variance") ||
    text.includes("bias variance") ||
    text.includes("overfit") ||
    text.includes("underfit") ||
    text.includes("failure") ||
    text.includes("complexity") ||
    text.includes("feature-importance") ||
    text.includes("feature importance") ||
    text.includes("interpret") ||
    text.includes("stability") ||
    text.includes("correlation") ||
    text.includes("variance") ||
    text.includes("probabilities")
  ) {
    return "behavior";
  }


  // =======================================================
  // HOW IT WORKS
  // =======================================================

  if (
    text.includes("how") ||
    text.includes("learning-process") ||
    text.includes("learning process") ||
    text.includes("training") ||
    text.includes("prediction") ||
    text.includes("algorithm") ||
    text.includes("split-search") ||
    text.includes("split search") ||
    text.includes("recursive") ||
    text.includes("pruning") ||
    text.includes("bagging") ||
    text.includes("bootstrap") ||
    text.includes("oob") ||
    text.includes("aggregation")
  ) {
    return "algorithm";
  }


  // =======================================================
  // DEFAULT
  // =======================================================

  return "intuition";
}


function groupSectionsByTab(
  sections?: LessonSection[]
): SectionTabMap {
  const grouped =
    createEmptySectionTabMap();

  if (!sections) {
    return grouped;
  }

  sections.forEach((section) => {
    const tab =
      getSectionTab(section);

    grouped[tab].push(section);
  });

  return grouped;
}

function StringList({
  items,
}: {
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="model-deep-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}


function InformationBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="model-deep-info-block">
      <h5>{title}</h5>

      <div>
        {children}
      </div>
    </section>
  );
}
function ExistingLessonSectionCard({
  section,
}: {
  section: LessonSection;
}) {
  return (
    <article className="model-existing-section-card">
      <div className="model-existing-section-heading">
        <span>
          DEEP DIVE
        </span>

        <h5>
          {section.title}
        </h5>
      </div>

      <StringList
        items={section.explanation}
      />

      {section.intuition &&
        section.intuition.length > 0 && (
          <div className="model-existing-section-subblock">
            <h6>
              Intuition
            </h6>

            <StringList
              items={section.intuition}
            />
          </div>
        )}

      {section.importantPoints &&
        section.importantPoints.length >
          0 && (
          <div className="model-existing-section-subblock">
            <h6>
              Important points
            </h6>

            <StringList
              items={
                section.importantPoints
              }
            />
          </div>
        )}

      {section.mathematics && (
        <div className="model-existing-section-subblock">
          <h6>
            Mathematics
          </h6>

          {section.mathematics.formula && (
            <div className="lesson-formula">
              {
                section.mathematics
                  .formula
              }
            </div>
          )}

          <p>
  {section.mathematics.explanation}
</p>
        </div>
      )}

      {section.examples &&
        section.examples.length > 0 && (
          <div className="model-existing-section-subblock">
            <h6>
              Examples
            </h6>

            {section.examples.map(
              (example, index) => (
                <div
                  key={`${section.id}-example-${index}`}
                  className="model-existing-example"
                >
                  <strong>
                    {example.title ??
                      `Example ${index + 1}`}
                  </strong>

                  {example.explanation && (
  <p>
    {example.explanation}
  </p>
)}
                </div>
              )
            )}
          </div>
        )}
    </article>
  );
}


function ExistingSectionsForTab({
  sections,
}: {
  sections: LessonSection[];
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="model-existing-sections">
      <div className="model-existing-sections-header">
        <span>
          COMPLETE LESSON DEPTH
        </span>

        <h4>
          Detailed concept sections
        </h4>

        <p>
          These sections preserve the full
          detailed lesson content while keeping
          the model organized inside the current
          learning tab.
        </p>
      </div>

      <div className="model-existing-sections-grid">
        {sections.map((section) => (
          <ExistingLessonSectionCard
            key={section.id}
            section={section}
          />
        ))}
      </div>
    </section>
  );
}


function ParameterCard({
  parameter,
}: {
  parameter: LessonParameter;
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  return (
    <article className="model-parameter-card">
      <button
        type="button"
        className="model-parameter-header"
        onClick={() =>
          setExpanded(
            (current) => !current
          )
        }
        aria-expanded={expanded}
      >
        <div>
          <span className="model-parameter-category">
            {parameter.category ??
              "parameter"}
          </span>

          <h5>
            {parameter.displayName ??
              parameter.name}
          </h5>

          <p>
            {parameter.description}
          </p>
        </div>

        <span className="model-parameter-toggle">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="model-parameter-body">
          <InformationBlock title="Intuition">
            <p>
              {parameter.intuition}
            </p>
          </InformationBlock>

          {(parameter.defaultValue ||
            parameter.acceptedValues) && (
            <div className="model-parameter-summary-grid">
              {parameter.defaultValue && (
                <div>
                  <span>
                    DEFAULT
                  </span>

                  <strong>
                    {
                      parameter.defaultValue
                    }
                  </strong>
                </div>
              )}

              {parameter.acceptedValues && (
                <div>
                  <span>
                    ACCEPTED VALUES
                  </span>

                  <strong>
                    {
                      parameter.acceptedValues
                    }
                  </strong>
                </div>
              )}
            </div>
          )}

          {parameter.mathematicalMeaning && (
            <InformationBlock title="Mathematical meaning">
              <p>
                {
                  parameter.mathematicalMeaning
                }
              </p>
            </InformationBlock>
          )}

          <div className="model-parameter-effect-grid">
            {parameter.lowValueEffect &&
              parameter.lowValueEffect
                .length > 0 && (
                <InformationBlock title="Lower value">
                  <StringList
                    items={
                      parameter.lowValueEffect
                    }
                  />
                </InformationBlock>
              )}

            {parameter.highValueEffect &&
              parameter.highValueEffect
                .length > 0 && (
                <InformationBlock title="Higher value">
                  <StringList
                    items={
                      parameter.highValueEffect
                    }
                  />
                </InformationBlock>
              )}
          </div>

          {(parameter.biasEffect ||
            parameter.varianceEffect ||
            parameter.overfittingEffect ||
            parameter.underfittingEffect) && (
            <div className="model-parameter-behavior-grid">
              {parameter.biasEffect && (
                <div>
                  <span>BIAS</span>

                  <p>
                    {
                      parameter.biasEffect
                    }
                  </p>
                </div>
              )}

              {parameter.varianceEffect && (
                <div>
                  <span>
                    VARIANCE
                  </span>

                  <p>
                    {
                      parameter.varianceEffect
                    }
                  </p>
                </div>
              )}

              {parameter.overfittingEffect && (
                <div>
                  <span>
                    OVERFITTING
                  </span>

                  <p>
                    {
                      parameter.overfittingEffect
                    }
                  </p>
                </div>
              )}

              {parameter.underfittingEffect && (
                <div>
                  <span>
                    UNDERFITTING
                  </span>

                  <p>
                    {
                      parameter.underfittingEffect
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {parameter.computationalEffect && (
            <InformationBlock title="Computational effect">
              <p>
                {
                  parameter.computationalEffect
                }
              </p>
            </InformationBlock>
          )}

          {parameter.memoryEffect && (
            <InformationBlock title="Memory effect">
              <p>
                {parameter.memoryEffect}
              </p>
            </InformationBlock>
          )}

          {parameter.whenToIncrease &&
            parameter.whenToIncrease
              .length > 0 && (
              <InformationBlock title="When to increase it">
                <StringList
                  items={
                    parameter.whenToIncrease
                  }
                />
              </InformationBlock>
            )}

          {parameter.whenToDecrease &&
            parameter.whenToDecrease
              .length > 0 && (
              <InformationBlock title="When to decrease it">
                <StringList
                  items={
                    parameter.whenToDecrease
                  }
                />
              </InformationBlock>
            )}

          {parameter.whenToTune &&
            parameter.whenToTune.length >
              0 && (
              <InformationBlock title="When to tune it">
                <StringList
                  items={
                    parameter.whenToTune
                  }
                />
              </InformationBlock>
            )}

          {parameter.whenNotToTune &&
            parameter.whenNotToTune
              .length > 0 && (
              <InformationBlock title="When not to focus on it">
                <StringList
                  items={
                    parameter.whenNotToTune
                  }
                />
              </InformationBlock>
            )}

          {parameter.tuningStrategy &&
            parameter.tuningStrategy
              .length > 0 && (
              <InformationBlock title="Tuning strategy">
                <StringList
                  items={
                    parameter.tuningStrategy
                  }
                />
              </InformationBlock>
            )}

          {parameter.recommendedValues &&
            parameter.recommendedValues
              .length > 0 && (
              <InformationBlock title="Useful values to explore">
                <StringList
                  items={
                    parameter.recommendedValues
                  }
                />
              </InformationBlock>
            )}

          {parameter.interactions &&
            parameter.interactions.length >
              0 && (
              <InformationBlock title="Parameter interactions">
                <div className="model-parameter-interactions">
                  {parameter.interactions.map(
                    (
                      interaction,
                      index
                    ) => (
                      <div
                        key={`${parameter.id}-interaction-${index}`}
                      >
                        <strong>
                          {
                            interaction.parameter
                          }
                        </strong>

                        <p>
                          {
                            interaction.explanation
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </InformationBlock>
            )}

          {parameter.commonMistakes &&
            parameter.commonMistakes
              .length > 0 && (
              <InformationBlock title="Common mistakes">
                <StringList
                  items={
                    parameter.commonMistakes
                  }
                />
              </InformationBlock>
            )}

          {parameter.examNotes &&
            parameter.examNotes.length >
              0 && (
              <InformationBlock title="Exam notes">
                <StringList
                  items={
                    parameter.examNotes
                  }
                />
              </InformationBlock>
            )}

          {parameter.interviewNotes &&
            parameter.interviewNotes
              .length > 0 && (
              <InformationBlock title="Interview notes">
                <StringList
                  items={
                    parameter.interviewNotes
                  }
                />
              </InformationBlock>
            )}
        </div>
      )}
    </article>
  );
}


export default function RoadmapModelDeepDive({
  deepDive,
  sections,
}: RoadmapModelDeepDiveProps) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<DeepDiveTab>(
    "intuition"
  );
  const groupedSections =
  groupSectionsByTab(sections);
    if (!deepDive) {
    return null;
  }

  return (
    <section className="model-deep-dive">
      <header className="model-deep-header">
        <div>
          <span className="roadmap-section-label">
            MODEL DEEP DIVE
          </span>

          <h4>
            Understand the model,
            not just the API
          </h4>

          <p>
            Learn why the model works,
            how it learns, how its
            parameters change its
            behaviour, and when you
            should or should not use it.
          </p>
        </div>

        <div className="model-deep-meta">
          <span>
            {deepDive.modelFamily}
          </span>

          <span>
            {deepDive.depth}
          </span>
        </div>
      </header>

      <div className="model-deep-problem-types">
        {deepDive.problemTypes.map(
          (type) => (
            <span key={type}>
              {type}
            </span>
          )
        )}
      </div>

      <nav
        className="model-deep-tabs"
        aria-label="Model deep dive sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id
                ? "model-deep-tab model-deep-tab-active"
                : "model-deep-tab"
            }
            onClick={() =>
              setActiveTab(tab.id)
            }
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="model-deep-content">
        {activeTab === "intuition" && (
          <>
            <InformationBlock title="Why this model exists">
              <StringList
                items={
                  deepDive.motivation
                }
              />
            </InformationBlock>

            <InformationBlock title="Core intuition">
              <StringList
                items={
                  deepDive.intuition
                }
              />
            </InformationBlock>

            {deepDive.mentalModel &&
              deepDive.mentalModel.length >
                0 && (
                <InformationBlock title="Mental model">
                  <StringList
                    items={
                      deepDive.mentalModel
                    }
                  />
                </InformationBlock>
              )}

            <div className="model-deep-two-column">
              <InformationBlock title="Advantages">
                <StringList
                  items={
                    deepDive.advantages
                  }
                />
              </InformationBlock>

              <InformationBlock title="Limitations">
                <StringList
                  items={
                    deepDive.limitations
                  }
                />
              </InformationBlock>
            </div>

            <div className="model-deep-two-column">
              <InformationBlock title="When to use it">
                <StringList
                  items={
                    deepDive.whenToUse
                  }
                />
              </InformationBlock>

              <InformationBlock title="When not to use it">
                <StringList
                  items={
                    deepDive.whenNotToUse
                  }
                />
              </InformationBlock>
            </div>
          </>
        )}

        {activeTab === "algorithm" && (
          <>
            <InformationBlock title="Training — step by step">
              <div className="model-algorithm-steps">
                {deepDive.trainingProcess.map(
                  (step) => (
                    <article
                      key={step.id}
                      className="model-algorithm-step"
                    >
                      <span>
                        {String(
                          step.step
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div>
                        <h5>
                          {step.title}
                        </h5>

                        <p>
                          {
                            step.explanation
                          }
                        </p>

                        {step.intuition && (
                          <p className="model-step-intuition">
                            <strong>
                              Intuition:
                            </strong>{" "}
                            {
                              step.intuition
                            }
                          </p>
                        )}

                        {step.mathematics && (
                          <div className="model-step-math">
                            {
                              step.mathematics
                            }
                          </div>
                        )}

                        {step.example && (
                          <p>
                            <strong>
                              Example:
                            </strong>{" "}
                            {step.example}
                          </p>
                        )}

                        <StringList
                          items={
                            step.importantPoints
                          }
                        />
                      </div>
                    </article>
                  )
                )}
              </div>
            </InformationBlock>

            {deepDive.predictionProcess &&
              deepDive.predictionProcess
                .length > 0 && (
                <InformationBlock title="Prediction — what happens after training?">
                  <div className="model-algorithm-steps">
                    {deepDive.predictionProcess.map(
                      (step) => (
                        <article
                          key={
                            step.id
                          }
                          className="model-algorithm-step"
                        >
                          <span>
                            {String(
                              step.step
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>
                            <h5>
                              {
                                step.title
                              }
                            </h5>

                            <p>
                              {
                                step.explanation
                              }
                            </p>

                            {step.intuition && (
                              <p className="model-step-intuition">
                                {
                                  step.intuition
                                }
                              </p>
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </InformationBlock>
              )}
          </>
        )}

        {activeTab ===
          "mathematics" && (
          <>
            {deepDive.mathematics &&
            deepDive.mathematics.length >
              0 ? (
              deepDive.mathematics.map(
                (math, index) => (
                  <InformationBlock
                    key={`deep-math-${index}`}
                    title={
                      math.title ??
                      `Mathematics ${
                        index + 1
                      }`
                    }
                  >
                    <p>
                      {
                        math.explanation
                      }
                    </p>

                    {math.formula && (
                      <div className="lesson-formula">
                        {
                          math.formula
                        }
                      </div>
                    )}

                    {math.variables &&
                      math.variables
                        .length > 0 && (
                        <div className="lesson-math-variables">
                          {math.variables.map(
                            (
                              variable,
                              variableIndex
                            ) => (
                              <div
                                key={`deep-math-variable-${index}-${variableIndex}`}
                                className="lesson-math-variable"
                              >
                                <strong>
                                  {
                                    variable.symbol
                                  }
                                </strong>

                                <span>
                                  {
                                    variable.meaning
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {math.example && (
                      <div className="lesson-math-example">
                        <strong>
                          Example
                        </strong>

                        <p>
                          {
                            math.example
                          }
                        </p>
                      </div>
                    )}
                  </InformationBlock>
                )
              )
            ) : (
              <p>
                Additional mathematical
                detail is not required for
                this model.
              </p>
            )}

            {deepDive.objectiveFunctions?.map(
              (
                objective,
                index
              ) => (
                <InformationBlock
                  key={`objective-${index}`}
                  title={
                    objective.name
                  }
                >
                  <p>
                    {
                      objective.purpose
                    }
                  </p>

                  <StringList
                    items={
                      objective.intuition
                    }
                  />

                  {objective.formula && (
                    <div className="lesson-formula">
                      {
                        objective.formula
                      }
                    </div>
                  )}

                  <StringList
                    items={
                      objective.explanation
                    }
                  />

                  {objective.practicalMeaning &&
                    objective
                      .practicalMeaning
                      .length > 0 && (
                      <>
                        <h6>
                          Practical meaning
                        </h6>

                        <StringList
                          items={
                            objective.practicalMeaning
                          }
                        />
                      </>
                    )}
                </InformationBlock>
              )
            )}
          </>
        )}

        {activeTab === "parameters" && (
  <RoadmapModelParameters
    modelName={deepDive.modelFamily}
    parameters={deepDive.parameters}
    fitParameters={
      deepDive.modelFamily ===
      "Linear Models / Regression"
        ? [
            {
              id: "lr-fit-sample-weight",
              name: "sample_weight",
              displayName:
                "Sample Weight",
              type:
                "array-like of shape (n_samples,), optional",
              defaultValue: "None",
              description:
                "Provides an individual weight for each training sample when fitting Linear Regression.",
              intuition:
                "Normally every training row contributes equally to the least-squares objective. sample_weight lets some observations contribute more strongly than others.",
              whenToUse: [
                "When observations should have different importance.",
                "When reliability or exposure differs between observations and weighting is justified by the problem.",
                "When the learning objective intentionally requires weighted least squares.",
              ],
              importantPoints: [
                "sample_weight is passed to fit(...); it is not a LinearRegression constructor hyperparameter.",
                "Larger sample weights make the corresponding observations contribute more strongly to fitting.",
                "Weighting changes the fitted least-squares objective.",
              ],
              commonMistakes: [
                "Treating sample_weight as a constructor parameter.",
                "Using arbitrary weights without understanding what they represent.",
                "Using sample weights to hide poor-quality data instead of investigating it.",
              ],
            },
          ]
        : []
    }
    learnedAttributes={
      deepDive.modelFamily ===
      "Linear Models / Regression"
        ? [
            {
              id: "lr-attribute-coef",
              name: "coef_",
              displayName:
                "Learned Coefficients",
              type:
                "array of shape (n_features,) or (n_targets, n_features)",
              description:
                "Contains the feature coefficients learned during model fitting.",
              interpretation: [
                "The sign indicates the direction of the fitted linear relationship.",
                "A positive coefficient increases the prediction as that feature increases, holding the other modeled features fixed.",
                "A negative coefficient decreases the prediction as that feature increases.",
                "Magnitude depends on feature units, so raw coefficient sizes should not be compared carelessly across differently scaled features.",
              ],
              importantPoints: [
                "coef_ is learned from data.",
                "It is not supplied before training.",
                "Multicollinearity can make individual coefficients unstable.",
              ],
            },

            {
              id: "lr-attribute-intercept",
              name: "intercept_",
              displayName:
                "Learned Intercept",
              type:
                "float or array",
              description:
                "Contains the intercept learned by the fitted regression model.",
              interpretation: [
                "It represents the model prediction when all input features are zero.",
                "Its practical meaning depends on whether zero is meaningful for the features.",
              ],
              importantPoints: [
                "When fit_intercept=false, the model does not independently estimate a normal intercept term.",
                "The intercept should not automatically be interpreted as meaningful if zero lies outside the realistic feature range.",
              ],
            },

            {
              id: "lr-attribute-rank",
              name: "rank_",
              displayName:
                "Design Matrix Rank",
              type: "integer",
              description:
                "Reports the rank of the feature matrix for supported dense-input fitting.",
              interpretation: [
                "Rank describes the number of linearly independent directions represented by the design matrix.",
                "Rank deficiency can indicate exact linear dependence among features.",
              ],
              importantPoints: [
                "This is a diagnostic learned attribute, not a tuning parameter.",
                "It is associated with dense-input fitting.",
              ],
            },

            {
              id: "lr-attribute-singular",
              name: "singular_",
              displayName:
                "Singular Values",
              type:
                "array of shape (min(X.shape),)",
              description:
                "Contains singular values of the feature matrix for supported dense-input fitting.",
              interpretation: [
                "Singular values provide information about the numerical structure of the design matrix.",
                "Very small singular values can be associated with poorly conditioned or nearly dependent feature directions.",
              ],
              importantPoints: [
                "This is not a model hyperparameter.",
                "It can help advanced users reason about matrix conditioning.",
              ],
            },

            {
              id: "lr-attribute-n-features",
              name: "n_features_in_",
              displayName:
                "Number of Input Features",
              type: "integer",
              description:
                "Stores the number of features observed by the estimator during fitting.",
              interpretation: [
                "If the training matrix contained five predictor columns, n_features_in_ is normally 5.",
              ],
              importantPoints: [
                "Useful for estimator validation and inspection.",
                "It is learned metadata, not a tunable parameter.",
              ],
            },

            {
              id: "lr-attribute-feature-names",
              name: "feature_names_in_",
              displayName:
                "Input Feature Names",
              type:
                "array of shape (n_features_in_,)",
              description:
                "Stores input feature names when the estimator was fitted with supported named feature input.",
              interpretation: [
                "Helps connect learned coefficients and estimator behavior back to the original named columns.",
              ],
              importantPoints: [
                "Available when suitable feature names were supplied during fitting.",
                "It is estimator metadata, not a hyperparameter.",
              ],
            },
          ]
        : []
    }
    tuningSummary={
      deepDive.modelFamily ===
      "Linear Models / Regression"
        ? {
            tuneFirst: [
              "LinearRegression has very few predictive hyperparameters.",
              "Focus first on feature quality, leakage prevention, functional form and validation.",
              "Consider positive only when non-negative coefficients are genuinely required by the problem.",
              "Consider solver tolerance only when numerical behavior makes it relevant.",
              "If regularization strength needs tuning, compare Ridge, Lasso or Elastic Net rather than inventing a LinearRegression regularization parameter.",
            ],

            usuallyLeaveDefault: [
              "fit_intercept=true for most ordinary regression problems.",
              "copy_X=true unless memory/data-handling requirements justify changing it.",
              "n_jobs is mainly a computational setting rather than a predictive-performance parameter.",
            ],

            notHyperparameters: [
              "coef_",
              "intercept_",
              "rank_",
              "singular_",
              "n_features_in_",
              "feature_names_in_",
              "sample_weight — this is a fit argument rather than a constructor hyperparameter.",
            ],
          }
        : undefined
    }
  />
)}

        {activeTab === "behavior" && (
          <>
            {deepDive.biasVariance && (
              <InformationBlock title="Bias–variance behavior">
                <div className="model-bias-variance-summary">
                  <div>
                    <span>BIAS</span>
                    <strong>
                      {
                        deepDive
                          .biasVariance
                          .bias
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      VARIANCE
                    </span>
                    <strong>
                      {
                        deepDive
                          .biasVariance
                          .variance
                      }
                    </strong>
                  </div>
                </div>

                <StringList
                  items={
                    deepDive
                      .biasVariance
                      .explanation
                  }
                />

                <h6>
                  Causes of
                  underfitting
                </h6>

                <StringList
                  items={
                    deepDive
                      .biasVariance
                      .underfittingCauses
                  }
                />

                <h6>
                  Causes of overfitting
                </h6>

                <StringList
                  items={
                    deepDive
                      .biasVariance
                      .overfittingCauses
                  }
                />

                <h6>
                  Reduce underfitting
                </h6>

                <StringList
                  items={
                    deepDive
                      .biasVariance
                      .reduceUnderfitting
                  }
                />

                <h6>
                  Reduce overfitting
                </h6>

                <StringList
                  items={
                    deepDive
                      .biasVariance
                      .reduceOverfitting
                  }
                />
              </InformationBlock>
            )}

            {deepDive.complexity && (
              <InformationBlock title="Computational complexity">
                <div className="model-complexity-grid">
                  {deepDive.complexity
                    .training && (
                    <div>
                      <span>
                        TRAINING
                      </span>

                      <strong>
                        {
                          deepDive
                            .complexity
                            .training
                        }
                      </strong>
                    </div>
                  )}

                  {deepDive.complexity
                    .prediction && (
                    <div>
                      <span>
                        PREDICTION
                      </span>

                      <strong>
                        {
                          deepDive
                            .complexity
                            .prediction
                        }
                      </strong>
                    </div>
                  )}

                  {deepDive.complexity
                    .memory && (
                    <div>
                      <span>
                        MEMORY
                      </span>

                      <strong>
                        {
                          deepDive
                            .complexity
                            .memory
                        }
                      </strong>
                    </div>
                  )}
                </div>

                <StringList
                  items={
                    deepDive.complexity
                      .explanation
                  }
                />

                <StringList
                  items={
                    deepDive.complexity
                      .scalabilityNotes
                  }
                />
              </InformationBlock>
            )}

            {deepDive.failureModes &&
              deepDive.failureModes
                .length > 0 && (
                <InformationBlock title="Failure modes & debugging">
                  <div className="model-failure-list">
                    {deepDive.failureModes.map(
                      (failure) => (
                        <article
                          key={
                            failure.id
                          }
                        >
                          <h5>
                            {
                              failure.symptom
                            }
                          </h5>

                          <h6>
                            Likely causes
                          </h6>

                          <StringList
                            items={
                              failure.likelyCauses
                            }
                          />

                          <h6>
                            Diagnosis
                          </h6>

                          <StringList
                            items={
                              failure.diagnosis
                            }
                          />

                          <h6>
                            Fixes
                          </h6>

                          <StringList
                            items={
                              failure.fixes
                            }
                          />
                        </article>
                      )
                    )}
                  </div>
                </InformationBlock>
              )}
          </>
        )}

        {activeTab === "data" && (
          <>
            {deepDive.dataRequirements ? (
              <div className="model-data-requirements">
                {deepDive.dataRequirements
                  .scaling && (
                  <InformationBlock title="Feature scaling">
                    <strong>
                      {deepDive
                        .dataRequirements
                        .scaling.required
                        ? "Required / strongly recommended"
                        : "Usually not required"}
                    </strong>

                    <p>
                      {
                        deepDive
                          .dataRequirements
                          .scaling
                          .explanation
                      }
                    </p>
                  </InformationBlock>
                )}

                {deepDive.dataRequirements
                  .categoricalFeatures && (
                  <InformationBlock title="Categorical features">
                    <p>
                      {
                        deepDive
                          .dataRequirements
                          .categoricalFeatures
                          .explanation
                      }
                    </p>

                    <StringList
                      items={
                        deepDive
                          .dataRequirements
                          .categoricalFeatures
                          .recommendations
                      }
                    />
                  </InformationBlock>
                )}

                {deepDive.dataRequirements
                  .missingValues && (
                  <InformationBlock title="Missing values">
                    <p>
                      {
                        deepDive
                          .dataRequirements
                          .missingValues
                          .explanation
                      }
                    </p>

                    <StringList
                      items={
                        deepDive
                          .dataRequirements
                          .missingValues
                          .recommendations
                      }
                    />
                  </InformationBlock>
                )}

                {deepDive.dataRequirements
                  .outliers && (
                  <InformationBlock title="Outliers">
                    <strong>
                      Sensitivity:{" "}
                      {
                        deepDive
                          .dataRequirements
                          .outliers
                          .sensitivity
                      }
                    </strong>

                    <p>
                      {
                        deepDive
                          .dataRequirements
                          .outliers
                          .explanation
                      }
                    </p>

                    <StringList
                      items={
                        deepDive
                          .dataRequirements
                          .outliers
                          .recommendations
                      }
                    />
                  </InformationBlock>
                )}

                {deepDive.dataRequirements
                  .imbalance && (
                  <InformationBlock title="Class imbalance">
                    <strong>
                      Sensitivity:{" "}
                      {
                        deepDive
                          .dataRequirements
                          .imbalance
                          .sensitivity
                      }
                    </strong>

                    <p>
                      {
                        deepDive
                          .dataRequirements
                          .imbalance
                          .explanation
                      }
                    </p>

                    <StringList
                      items={
                        deepDive
                          .dataRequirements
                          .imbalance
                          .recommendations
                      }
                    />
                  </InformationBlock>
                )}

                <InformationBlock title="Feature distribution">
                  <StringList
                    items={
                      deepDive
                        .dataRequirements
                        .featureDistribution
                    }
                  />
                </InformationBlock>

                <InformationBlock title="Dataset size">
                  <StringList
                    items={
                      deepDive
                        .dataRequirements
                        .sampleSizeConsiderations
                    }
                  />
                </InformationBlock>

                <InformationBlock title="High dimensional data">
                  <StringList
                    items={
                      deepDive
                        .dataRequirements
                        .dimensionalityConsiderations
                    }
                  />
                </InformationBlock>
              </div>
            ) : (
              <p>
                No special data
                requirements are configured
                for this lesson.
              </p>
            )}
          </>
        )}

        {activeTab === "tuning" && (
          <>
            {deepDive.tuning ? (
              <>
                <InformationBlock title="Tuning strategy">
                  <StringList
                    items={
                      deepDive.tuning
                        .strategy
                    }
                  />
                </InformationBlock>

                <div className="model-deep-two-column">
                  <InformationBlock title="Tune these first">
                    <StringList
                      items={
                        deepDive.tuning
                          .tuneFirst
                      }
                    />
                  </InformationBlock>

                  <InformationBlock title="Tune these later">
                    <StringList
                      items={
                        deepDive.tuning
                          .tuneLater
                      }
                    />
                  </InformationBlock>
                </div>

                <InformationBlock title="Search-space guidance">
                  <StringList
                    items={
                      deepDive.tuning
                        .searchSpaceTips
                    }
                  />
                </InformationBlock>

                <InformationBlock title="Important parameter interactions">
                  <StringList
                    items={
                      deepDive.tuning
                        .parameterInteractions
                    }
                  />
                </InformationBlock>

                <InformationBlock title="Practical workflow">
                  <StringList
                    items={
                      deepDive.tuning
                        .practicalWorkflow
                    }
                  />
                </InformationBlock>

                {deepDive.tuning
                  .gridSearchExample && (
                  <InformationBlock title="GridSearchCV example">
                    <pre>
                      <code>
                        {
                          deepDive
                            .tuning
                            .gridSearchExample
                        }
                      </code>
                    </pre>
                  </InformationBlock>
                )}

                {deepDive.tuning
                  .randomizedSearchExample && (
                  <InformationBlock title="RandomizedSearchCV example">
                    <pre>
                      <code>
                        {
                          deepDive
                            .tuning
                            .randomizedSearchExample
                        }
                      </code>
                    </pre>
                  </InformationBlock>
                )}
              </>
            ) : (
              <p>
                A dedicated tuning guide
                has not been configured for
                this model yet.
              </p>
            )}
          </>
        )}

        {activeTab ===
          "comparison" && (
          <>
            {deepDive.comparisons &&
            deepDive.comparisons.length >
              0 ? (
              <div className="model-comparison-list">
                {deepDive.comparisons.map(
                  (
                    comparison,
                    index
                  ) => (
                    <article
                      key={`${comparison.model}-${index}`}
                      className="model-comparison-card"
                    >
                      <h5>
                        vs.{" "}
                        {
                          comparison.model
                        }
                      </h5>

                      {comparison.relationship && (
                        <p>
                          {
                            comparison.relationship
                          }
                        </p>
                      )}

                      <h6>
                        Differences
                      </h6>

                      <StringList
                        items={
                          comparison.differences
                        }
                      />

                      <h6>
                        Prefer this model
                        when
                      </h6>

                      <StringList
                        items={
                          comparison.preferCurrentWhen
                        }
                      />

                      <h6>
                        Prefer{" "}
                        {
                          comparison.model
                        }{" "}
                        when
                      </h6>

                      <StringList
                        items={
                          comparison.preferOtherWhen
                        }
                      />

                      {comparison.examTip && (
                        <p className="model-comparison-exam-tip">
                          <strong>
                            Exam tip:
                          </strong>{" "}
                          {
                            comparison.examTip
                          }
                        </p>
                      )}
                    </article>
                  )
                )}
              </div>
            ) : (
              <p>
                Model comparisons will be
                added with the lesson
                content.
              </p>
            )}
          </>
        )}

        {activeTab ===
          "applications" && (
          <>
            {deepDive.realWorldApplications &&
            deepDive
              .realWorldApplications
              .length > 0 ? (
              <div className="model-application-list">
                {deepDive.realWorldApplications.map(
                  (
                    application,
                    index
                  ) => (
                    <article
                      key={`${application.title}-${index}`}
                      className="model-application-card"
                    >
                      <span>
                        {
                          application.domain
                        }
                      </span>

                      <h5>
                        {
                          application.title
                        }
                      </h5>

                      <p>
                        {
                          application.problem
                        }
                      </p>

                      {application.whyModelFits && (
                        <p>
                          <strong>
                            Why it fits:
                          </strong>{" "}
                          {
                            application.whyModelFits
                          }
                        </p>
                      )}

                      <StringList
                        items={
                          application.limitations
                        }
                      />
                    </article>
                  )
                )}
              </div>
            ) : (
              <p>
                Real-world applications
                will be provided with the
                model content.
              </p>
            )}
          </>
        )}

        {activeTab === "exam" && (
          <>
            {deepDive.examNotes &&
              deepDive.examNotes.length >
                0 && (
                <InformationBlock title="Exam preparation">
                  <div className="model-exam-notes">
                    {deepDive.examNotes.map(
                      (
                        note,
                        index
                      ) => (
                        <article
                          key={`${note.title}-${index}`}
                        >
                          <h5>
                            {
                              note.title
                            }
                          </h5>

                          <StringList
                            items={
                              note.points
                            }
                          />

                          {note.formula && (
                            <div className="lesson-formula">
                              {
                                note.formula
                              }
                            </div>
                          )}

                          {note.commonQuestion && (
                            <p>
                              <strong>
                                Common
                                question:
                              </strong>{" "}
                              {
                                note.commonQuestion
                              }
                            </p>
                          )}
                        </article>
                      )
                    )}
                  </div>
                </InformationBlock>
              )}

            {deepDive.interviewQuestions &&
              deepDive
                .interviewQuestions
                .length > 0 && (
                <InformationBlock title="Interview questions">
                  <div className="model-interview-list">
                    {deepDive.interviewQuestions.map(
                      (
                        question,
                        index
                      ) => (
                        <article
                          key={`interview-${index}`}
                        >
                          <h5>
                            Q
                            {index +
                              1}
                            .{" "}
                            {
                              question.question
                            }
                          </h5>

                          <p>
                            <strong>
                              Short
                              answer:
                            </strong>{" "}
                            {
                              question.shortAnswer
                            }
                          </p>

                          <StringList
                            items={
                              question.deepAnswer
                            }
                          />

                          {question.followUpQuestions &&
                            question
                              .followUpQuestions
                              .length >
                              0 && (
                              <>
                                <h6>
                                  Follow-up
                                  questions
                                </h6>

                                <StringList
                                  items={
                                    question.followUpQuestions
                                  }
                                />
                              </>
                            )}
                        </article>
                      )
                    )}
                  </div>
                </InformationBlock>
              )}
          </>
        )}
      </div>
    </section>
  );
}
