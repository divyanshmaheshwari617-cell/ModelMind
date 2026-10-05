"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  LessonParameter,
} from "../../types/roadmap";


// =========================================================
// TYPES
// =========================================================

interface ModelFitParameter {
  id: string;
  name: string;
  displayName: string;
  type: string;
  defaultValue?: string;
  description: string;
  intuition: string;
  whenToUse?: string[];
  importantPoints?: string[];
  commonMistakes?: string[];
}

interface ModelLearnedAttribute {
  id: string;
  name: string;
  displayName: string;
  type?: string;
  description: string;
  interpretation?: string[];
  importantPoints?: string[];
}

interface RoadmapModelParametersProps {
  modelName: string;

  parameters: LessonParameter[];

  fitParameters?: ModelFitParameter[];

  learnedAttributes?: ModelLearnedAttribute[];

  tuningSummary?: {
    tuneFirst?: string[];
    usuallyLeaveDefault?: string[];
    notHyperparameters?: string[];
  };
}


// =========================================================
// HELPERS
// =========================================================

function TextList({
  items,
}: {
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="model-param-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}


function DetailBlock({
  title,
  children,
  full = false,
}: {
  title: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={
        full
          ? "model-param-detail model-param-detail-full"
          : "model-param-detail"
      }
    >
      <span className="model-param-detail-label">
        {title}
      </span>

      <div className="model-param-detail-content">
        {children}
      </div>
    </div>
  );
}


// =========================================================
// MODEL PARAMETER CARD
// =========================================================

function ModelParameterCard({
  parameter,
}: {
  parameter: LessonParameter;
}) {
  const [expanded, setExpanded] =
    useState(false);

  return (
    <article
      className={
        expanded
          ? "model-param-card model-param-card-expanded"
          : "model-param-card"
      }
    >
      <button
        type="button"
        className="model-param-card-header"
        onClick={() =>
          setExpanded(
            (current) => !current
          )
        }
      >
        <div className="model-param-card-heading">
          <div className="model-param-card-topline">
            <code>
              {parameter.name}
            </code>

            {parameter.category && (
              <span className="model-param-category">
                {parameter.category}
              </span>
            )}
          </div>

          <h4>
            {parameter.displayName ??
              parameter.name}
          </h4>

          <p>
            {parameter.description}
          </p>
        </div>

        <span className="model-param-expand">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="model-param-card-body">

          {/* QUICK FACTS */}

          <div className="model-param-quick-grid">

            {parameter.defaultValue && (
              <div>
                <span>
                  DEFAULT
                </span>

                <strong>
                  {parameter.defaultValue}
                </strong>
              </div>
            )}

            {parameter.acceptedValues && (
              <div>
                <span>
                  ACCEPTED VALUES
                </span>

                <strong>
                  {parameter.acceptedValues}
                </strong>
              </div>
            )}

            {parameter.category && (
              <div>
                <span>
                  CATEGORY
                </span>

                <strong>
                  {parameter.category}
                </strong>
              </div>
            )}

          </div>


          {/* INTUITION */}

          <DetailBlock
            title="Intuition"
            full
          >
            <p>
              {parameter.intuition}
            </p>
          </DetailBlock>


          {/* MATHEMATICAL MEANING */}

          {parameter.mathematicalMeaning && (
            <DetailBlock
              title="Mathematical meaning"
              full
            >
              <p className="model-param-math">
                {
                  parameter.mathematicalMeaning
                }
              </p>
            </DetailBlock>
          )}


          {/* LOW / HIGH */}

          {(parameter.lowValueEffect ||
            parameter.highValueEffect) && (
            <div className="model-param-two-column">

              {parameter.lowValueEffect && (
                <DetailBlock title="Lower value / disabled">
                  <TextList
                    items={
                      parameter.lowValueEffect
                    }
                  />
                </DetailBlock>
              )}

              {parameter.highValueEffect && (
                <DetailBlock title="Higher value / enabled">
                  <TextList
                    items={
                      parameter.highValueEffect
                    }
                  />
                </DetailBlock>
              )}

            </div>
          )}


          {/* MODEL BEHAVIOUR */}

          <div className="model-param-behavior-grid">

            {parameter.biasEffect && (
              <DetailBlock title="Bias">
                <p>
                  {parameter.biasEffect}
                </p>
              </DetailBlock>
            )}

            {parameter.varianceEffect && (
              <DetailBlock title="Variance">
                <p>
                  {parameter.varianceEffect}
                </p>
              </DetailBlock>
            )}

            {parameter.overfittingEffect && (
              <DetailBlock title="Overfitting">
                <p>
                  {
                    parameter.overfittingEffect
                  }
                </p>
              </DetailBlock>
            )}

            {parameter.underfittingEffect && (
              <DetailBlock title="Underfitting">
                <p>
                  {
                    parameter.underfittingEffect
                  }
                </p>
              </DetailBlock>
            )}

          </div>


          {/* COMPUTATION */}

          {(parameter.computationalEffect ||
            parameter.memoryEffect) && (
            <div className="model-param-two-column">

              {parameter.computationalEffect && (
                <DetailBlock title="Computation">
                  <p>
                    {
                      parameter.computationalEffect
                    }
                  </p>
                </DetailBlock>
              )}

              {parameter.memoryEffect && (
                <DetailBlock title="Memory">
                  <p>
                    {
                      parameter.memoryEffect
                    }
                  </p>
                </DetailBlock>
              )}

            </div>
          )}


          {/* WHEN TO CHANGE */}

          {(parameter.whenToIncrease ||
            parameter.whenToDecrease) && (
            <div className="model-param-two-column">

              {parameter.whenToIncrease && (
                <DetailBlock title="When to increase / enable">
                  <TextList
                    items={
                      parameter.whenToIncrease
                    }
                  />
                </DetailBlock>
              )}

              {parameter.whenToDecrease && (
                <DetailBlock title="When to decrease / disable">
                  <TextList
                    items={
                      parameter.whenToDecrease
                    }
                  />
                </DetailBlock>
              )}

            </div>
          )}


          {/* TUNING */}

          {parameter.whenToTune && (
            <DetailBlock
              title="When should I tune this?"
              full
            >
              <TextList
                items={
                  parameter.whenToTune
                }
              />
            </DetailBlock>
          )}

          {parameter.whenNotToTune && (
            <DetailBlock
              title="When should I leave it alone?"
              full
            >
              <TextList
                items={
                  parameter.whenNotToTune
                }
              />
            </DetailBlock>
          )}

          {parameter.tuningStrategy && (
            <DetailBlock
              title="Practical tuning strategy"
              full
            >
              <TextList
                items={
                  parameter.tuningStrategy
                }
              />
            </DetailBlock>
          )}

          {parameter.recommendedValues && (
            <DetailBlock
              title="Recommended values / starting point"
              full
            >
              <TextList
                items={
                  parameter.recommendedValues
                }
              />
            </DetailBlock>
          )}


          {/* INTERACTIONS */}

          {parameter.interactions &&
            parameter.interactions.length >
              0 && (
              <DetailBlock
                title="Parameter interactions"
                full
              >
                <div className="model-param-interactions">
                  {parameter.interactions.map(
                    (
                      interaction,
                      index
                    ) => (
                      <div
                        key={`${interaction.parameter}-${index}`}
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
              </DetailBlock>
            )}


          {/* COMMON MISTAKES */}

          {parameter.commonMistakes && (
            <DetailBlock
              title="Common mistakes"
              full
            >
              <TextList
                items={
                  parameter.commonMistakes
                }
              />
            </DetailBlock>
          )}


          {/* EXAM */}

          {parameter.examNotes && (
            <DetailBlock
              title="Exam notes"
              full
            >
              <TextList
                items={
                  parameter.examNotes
                }
              />
            </DetailBlock>
          )}


          {/* INTERVIEW */}

          {parameter.interviewNotes && (
            <DetailBlock
              title="Interview notes"
              full
            >
              <TextList
                items={
                  parameter.interviewNotes
                }
              />
            </DetailBlock>
          )}

        </div>
      )}
    </article>
  );
}


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function RoadmapModelParameters({
  modelName,
  parameters,
  fitParameters = [],
  learnedAttributes = [],
  tuningSummary,
}: RoadmapModelParametersProps) {

  const [search, setSearch] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<
      | "model"
      | "fit"
      | "attributes"
    >("model");


  const filteredParameters =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return parameters;
      }

      return parameters.filter(
        (parameter) =>
          parameter.name
            .toLowerCase()
            .includes(query) ||
          (
            parameter.displayName ?? ""
          )
            .toLowerCase()
            .includes(query) ||
          parameter.description
            .toLowerCase()
            .includes(query)
      );
    }, [parameters, search]);


  return (
    <section className="model-parameters-page">

      {/* HEADER */}

      <header className="model-parameters-page-header">

        <div>
          <span className="model-parameters-eyebrow">
            PARAMETER ENCYCLOPEDIA
          </span>

          <h3>
            {modelName} Parameters
          </h3>

          <p>
            Understand what every important
            parameter actually controls,
            when it matters, how it affects
            the model, and whether you
            should tune it.
          </p>
        </div>

        <div className="model-parameters-count">
          <strong>
            {parameters.length}
          </strong>

          <span>
            model parameters
          </span>
        </div>

      </header>


      {/* IMPORTANT DISTINCTION */}

      <div className="model-param-definition-grid">

        <article>
          <span>
            MODEL PARAMETERS
          </span>

          <h4>
            Set before fitting
          </h4>

          <p>
            Configuration options passed
            to the model constructor.
          </p>
        </article>

        <article>
          <span>
            FIT PARAMETERS
          </span>

          <h4>
            Passed during training
          </h4>

          <p>
            Extra information supplied
            when calling the fitting
            method.
          </p>
        </article>

        <article>
          <span>
            LEARNED ATTRIBUTES
          </span>

          <h4>
            Created by training
          </h4>

          <p>
            Values learned or calculated
            after the estimator has been
            fitted.
          </p>
        </article>

      </div>


      {/* TUNING SUMMARY */}

      {tuningSummary && (
        <section className="model-param-tuning-summary">

          <h4>
            What should I actually tune?
          </h4>

          <div className="model-param-tuning-columns">

            {tuningSummary.tuneFirst && (
              <div>
                <span>
                  TUNE / CONSIDER
                </span>

                <TextList
                  items={
                    tuningSummary.tuneFirst
                  }
                />
              </div>
            )}

            {tuningSummary
              .usuallyLeaveDefault && (
              <div>
                <span>
                  USUALLY LEAVE DEFAULT
                </span>

                <TextList
                  items={
                    tuningSummary
                      .usuallyLeaveDefault
                  }
                />
              </div>
            )}

            {tuningSummary
              .notHyperparameters && (
              <div>
                <span>
                  NOT HYPERPARAMETERS
                </span>

                <TextList
                  items={
                    tuningSummary
                      .notHyperparameters
                  }
                />
              </div>
            )}

          </div>

        </section>
      )}


      {/* NAVIGATION */}

      <div className="model-param-section-tabs">

        <button
          type="button"
          className={
            activeSection === "model"
              ? "model-param-section-tab active"
              : "model-param-section-tab"
          }
          onClick={() =>
            setActiveSection("model")
          }
        >
          Model Parameters
          <span>
            {parameters.length}
          </span>
        </button>

        <button
          type="button"
          className={
            activeSection === "fit"
              ? "model-param-section-tab active"
              : "model-param-section-tab"
          }
          onClick={() =>
            setActiveSection("fit")
          }
        >
          Fit Parameters
          <span>
            {fitParameters.length}
          </span>
        </button>

        <button
          type="button"
          className={
            activeSection ===
            "attributes"
              ? "model-param-section-tab active"
              : "model-param-section-tab"
          }
          onClick={() =>
            setActiveSection(
              "attributes"
            )
          }
        >
          Learned Attributes
          <span>
            {learnedAttributes.length}
          </span>
        </button>

      </div>


      {/* MODEL PARAMETERS */}

      {activeSection === "model" && (
        <>

          <div className="model-param-search">
            <span>
              Search
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={`Search ${modelName} parameters...`}
            />
          </div>

          <div className="model-param-cards">
            {filteredParameters.map(
              (parameter) => (
                <ModelParameterCard
                  key={parameter.id}
                  parameter={parameter}
                />
              )
            )}
          </div>

          {filteredParameters.length ===
            0 && (
            <div className="model-param-empty">
              No parameter matched your
              search.
            </div>
          )}

        </>
      )}


      {/* FIT PARAMETERS */}

      {activeSection === "fit" && (
        <div className="model-param-simple-list">

          {fitParameters.length === 0 && (
            <div className="model-param-empty">
              No separate fit parameters
              are documented for this
              model yet.
            </div>
          )}

          {fitParameters.map(
            (parameter) => (
              <article
                key={parameter.id}
                className="model-param-simple-card"
              >
                <div className="model-param-simple-title">
                  <code>
                    {parameter.name}
                  </code>

                  <h4>
                    {
                      parameter.displayName
                    }
                  </h4>
                </div>

                <div className="model-param-quick-grid">

                  <div>
                    <span>
                      TYPE
                    </span>

                    <strong>
                      {parameter.type}
                    </strong>
                  </div>

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

                </div>

                <p>
                  {parameter.description}
                </p>

                <div className="model-param-callout">
                  <strong>
                    Intuition
                  </strong>

                  <p>
                    {parameter.intuition}
                  </p>
                </div>

                {parameter.whenToUse && (
                  <>
                    <h5>
                      When to use
                    </h5>

                    <TextList
                      items={
                        parameter.whenToUse
                      }
                    />
                  </>
                )}

                {parameter.importantPoints && (
                  <>
                    <h5>
                      Important points
                    </h5>

                    <TextList
                      items={
                        parameter
                          .importantPoints
                      }
                    />
                  </>
                )}

                {parameter.commonMistakes && (
                  <>
                    <h5>
                      Common mistakes
                    </h5>

                    <TextList
                      items={
                        parameter
                          .commonMistakes
                      }
                    />
                  </>
                )}

              </article>
            )
          )}

        </div>
      )}


      {/* LEARNED ATTRIBUTES */}

      {activeSection ===
        "attributes" && (
        <div className="model-param-simple-list">

          {learnedAttributes.length ===
            0 && (
            <div className="model-param-empty">
              No learned attributes are
              documented for this model
              yet.
            </div>
          )}

          {learnedAttributes.map(
            (attribute) => (
              <article
                key={attribute.id}
                className="model-param-simple-card"
              >
                <div className="model-param-simple-title">
                  <code>
                    {attribute.name}
                  </code>

                  <h4>
                    {
                      attribute.displayName
                    }
                  </h4>
                </div>

                {attribute.type && (
                  <div className="model-param-inline-type">
                    {
                      attribute.type
                    }
                  </div>
                )}

                <p>
                  {attribute.description}
                </p>

                {attribute.interpretation && (
                  <>
                    <h5>
                      How to interpret it
                    </h5>

                    <TextList
                      items={
                        attribute
                          .interpretation
                      }
                    />
                  </>
                )}

                {attribute.importantPoints && (
                  <>
                    <h5>
                      Important points
                    </h5>

                    <TextList
                      items={
                        attribute
                          .importantPoints
                      }
                    />
                  </>
                )}

              </article>
            )
          )}

        </div>
      )}

    </section>
  );
}