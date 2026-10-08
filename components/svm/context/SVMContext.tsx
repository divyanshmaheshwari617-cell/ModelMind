import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ActiveSVMDataset,
  LearningLevel,
  SVMExperimentResult,
  SVMParameters,
  SVMQueryPoint,
  SVMState,
  SVMTask,
  SVMVisualizationMode,
} from "../types/svm";

import {
  builtInDatasets,
} from "../dataset/defaultDatasets";

import {
  createActiveDataset,
  getColumns,
  getNumericColumns,
} from "../dataset/datasetUtils";

type SVMContextValue = {
  state: SVMState;

  setDataset:
    (
      dataset:
        ActiveSVMDataset | null
    ) => void;

  setTask:
    (task: SVMTask) => void;

  setLevel:
    (
      level:
        LearningLevel
    ) => void;

  updateParameters:
    (
      parameters:
        Partial<SVMParameters>
    ) => void;

  setQueryPoint:
    (
      point:
        SVMQueryPoint
    ) => void;

  setLearningStep:
    (step: number) => void;

  setPlaying:
    (playing: boolean) => void;

  setVisualizationMode:
    (
      mode:
        SVMVisualizationMode
    ) => void;

  addExperiment:
    (
      experiment:
        SVMExperimentResult
    ) => void;

  resetLab:
    () => void;
};

const defaultParameters:
  SVMParameters = {
    C: 1,
    kernel: "rbf",
    gamma: 0.5,
    degree: 3,
    coef0: 0,
    epsilon: 0.1,
    classWeight: "none",
  };

/*
 * =========================================================
 * BUILT-IN DATASET FACTORY
 * =========================================================
 */

function createBuiltInDataset(
  task: SVMTask
): ActiveSVMDataset | null {
  const preferredId =
    task === "classification"
      ? "svm-showcase"
      : "svr-regression";

  const builtIn =
    builtInDatasets.find(
      (dataset) =>
        dataset.id ===
        preferredId
    );

  if (!builtIn) {
    return null;
  }

  const columns =
    getColumns(
      builtIn.rows
    );

  const numericColumns =
    getNumericColumns(
      builtIn.rows
    );

  const targetColumn =
    task === "classification"
      ? (
          columns.includes(
            "Class"
          )
            ? "Class"
            : columns[
                columns.length - 1
              ] ?? ""
        )
      : (
          columns.includes(
            "Score"
          )
            ? "Score"
            : columns[
                columns.length - 1
              ] ?? ""
        );

  const featureColumns =
    numericColumns
      .filter(
        (column) =>
          column !==
          targetColumn
      )
      .slice(
        0,
        3
      );

  return createActiveDataset(
    builtIn.name,
    builtIn.rows,
    featureColumns,
    targetColumn,
    task,
    true,
    "builtin"
  );
}

function createInitialState():
  SVMState {
  const dataset =
    createBuiltInDataset(
      "classification"
    );

  return {
    dataset,

    task:
      "classification",

    level:
      "basic",

    parameters: {
      ...defaultParameters,
    },

    queryPoint: {
      values:
        dataset?.rows[0]
          ?.features.slice(
            0,
            3
          ) ??
        [0, 0, 0],
    },

    learningStep: 1,

    playing: false,

    visualizationMode:
      "learning",

    experiments: [],
  };
}

const SVMContext =
  createContext<
    SVMContextValue | undefined
  >(undefined);

type Props = {
  children: ReactNode;
};

export function SVMProvider({
  children,
}: Props) {
  const [
    state,
    setState,
  ] =
    useState<SVMState>(
      createInitialState
    );

  const value =
    useMemo<SVMContextValue>(
      () => ({
        state,

        /*
         * =================================================
         * DATASET
         * =================================================
         */

        setDataset:
          (dataset) => {
            setState(
              (current) => ({
                ...current,

                dataset,

                task:
                  dataset?.task ??
                  current.task,

                learningStep: 1,

                playing: false,

                queryPoint: {
                  values:
                    dataset?.rows[0]
                      ?.features.slice(
                        0,
                        3
                      ) ??
                    [0, 0, 0],
                },
              })
            );
          },

        /*
         * =================================================
         * TASK
         * =================================================
         *
         * IMPORTANT:
         *
         * Built-in mode:
         * SVC <-> SVR automatically switches
         * to the correct showcase dataset.
         *
         * Uploaded CSV:
         * NEVER replace the CSV.
         * Only change the task.
         *
         * Therefore user data always stays
         * active after upload.
         * =================================================
         */

        setTask:
          (task) => {
            setState(
              (current) => {
                const currentDataset =
                  current.dataset;

                const isUploaded =
                  currentDataset
                    ?.source ===
                  "uploaded";

                const isGenerated =
                  currentDataset
                    ?.source ===
                  "generated";

                /*
                 * Uploaded/generated data
                 * must remain active.
                 */
                if (
                  isUploaded ||
                  isGenerated
                ) {
                  const updatedDataset =
                    currentDataset
                      ? {
                          ...currentDataset,
                          task,
                        }
                      : null;

                  return {
                    ...current,

                    dataset:
                      updatedDataset,

                    task,

                    learningStep: 1,

                    playing: false,

                    queryPoint: {
                      values:
                        updatedDataset
                          ?.rows[0]
                          ?.features.slice(
                            0,
                            3
                          ) ??
                        current
                          .queryPoint
                          .values,
                    },
                  };
                }

                /*
                 * Built-in mode:
                 * automatically load
                 * corresponding showcase.
                 */
                const nextDataset =
                  createBuiltInDataset(
                    task
                  );

                return {
                  ...current,

                  dataset:
                    nextDataset,

                  task,

                  learningStep: 1,

                  playing: false,

                  queryPoint: {
                    values:
                      nextDataset
                        ?.rows[0]
                        ?.features.slice(
                          0,
                          3
                        ) ??
                      [0, 0, 0],
                  },
                };
              }
            );
          },

        /*
         * =================================================
         * LEVEL
         * =================================================
         */

        setLevel:
          (level) => {
            setState(
              (current) => ({
                ...current,
                level,
              })
            );
          },

        /*
         * =================================================
         * PARAMETERS
         * =================================================
         */

        updateParameters:
          (parameters) => {
            setState(
              (current) => ({
                ...current,

                parameters: {
                  ...current.parameters,
                  ...parameters,
                },
              })
            );
          },

        /*
         * =================================================
         * QUERY POINT
         * =================================================
         */

        setQueryPoint:
          (queryPoint) => {
            setState(
              (current) => ({
                ...current,
                queryPoint,
              })
            );
          },

        /*
         * =================================================
         * LEARNING PLAYER
         * =================================================
         */

        setLearningStep:
          (learningStep) => {
            setState(
              (current) => ({
                ...current,
                learningStep,
              })
            );
          },

        setPlaying:
          (playing) => {
            setState(
              (current) => ({
                ...current,
                playing,
              })
            );
          },

        /*
         * =================================================
         * VISUALIZATION MODE
         * =================================================
         */

        setVisualizationMode:
          (
            visualizationMode
          ) => {
            setState(
              (current) => ({
                ...current,
                visualizationMode,
              })
            );
          },

        /*
         * =================================================
         * EXPERIMENTS
         * =================================================
         */

        addExperiment:
          (experiment) => {
            setState(
              (current) => ({
                ...current,

                experiments: [
                  ...current
                    .experiments,
                  experiment,
                ],
              })
            );
          },

        /*
         * =================================================
         * RESET
         * =================================================
         */

        resetLab:
          () => {
            setState(
              createInitialState()
            );
          },
      }),

      [state]
    );

  return (
    <SVMContext.Provider
      value={value}
    >
      {children}
    </SVMContext.Provider>
  );
}

export function useSVM() {
  const context =
    useContext(
      SVMContext
    );

  if (!context) {
    throw new Error(
      "useSVM must be used inside SVMProvider"
    );
  }

  return context;
}