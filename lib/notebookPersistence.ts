import { NotebookCellType } from "@/types/notebook";

import {
  MODELMIND_PROJECT_VERSION,
  ModelMindProject,
  ProjectStore,
  ProjectSummary,
} from "@/types/project";

const PROJECT_STORAGE_KEY =
  "modelmind.projects.v1";

const DEFAULT_PROJECT_NAME =
  "Untitled Notebook";


// =========================================================
// STORAGE AVAILABILITY
// =========================================================

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}


// =========================================================
// ID GENERATOR
// =========================================================

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


// =========================================================
// DEFAULT NOTEBOOK CELLS
// =========================================================

export function createDefaultCells():
  NotebookCellType[] {
  return [
    {
      id: createId(),
      type: "code",

      content:
        '# Cell 1\nx = 100\nprint("x created:", x)',

      output: "",
      error: "",
      isRunning: false,
    },

    {
      id: createId(),
      type: "code",

      content:
        '# Cell 2\nprint("x from Cell 1:", x)',

      output: "",
      error: "",
      isRunning: false,
    },
  ];
}


// =========================================================
// CREATE PROJECT
// =========================================================

export function createProject(
  name = DEFAULT_PROJECT_NAME
): ModelMindProject {
  const now =
    new Date().toISOString();

  return {
    version:
      MODELMIND_PROJECT_VERSION,

    id: createId(),

    name:
      name.trim() ||
      DEFAULT_PROJECT_NAME,

    createdAt: now,
    updatedAt: now,

    cells:
      createDefaultCells(),

    uploadedFiles: [],

    experimentIds: [],
  };
}


// =========================================================
// EMPTY PROJECT STORE
// =========================================================

function createEmptyStore():
  ProjectStore {
  return {
    version:
      MODELMIND_PROJECT_VERSION,

    activeProjectId: null,

    projects: [],
  };
}


// =========================================================
// SANITIZE NOTEBOOK CELLS
// =========================================================

function sanitizeCells(
  cells: unknown
): NotebookCellType[] {
  if (!Array.isArray(cells)) {
    return createDefaultCells();
  }

  const validCells =
    cells.filter(
      (
        cell: unknown
      ): cell is NotebookCellType => {
        if (
          !cell ||
          typeof cell !== "object"
        ) {
          return false;
        }

        const candidate =
          cell as Partial<NotebookCellType>;

        return (
          typeof candidate.id ===
            "string" &&

          (
            candidate.type === "code" ||
            candidate.type === "markdown"
          ) &&

          typeof candidate.content ===
            "string"
        );
      }
    );

  if (validCells.length === 0) {
    return createDefaultCells();
  }

  return validCells.map(
    (
      cell: NotebookCellType
    ): NotebookCellType => ({
      ...cell,

      output:
        typeof cell.output === "string"
          ? cell.output
          : "",

      error:
        typeof cell.error === "string"
          ? cell.error
          : "",

      // A restored notebook is not
      // automatically running code.
      isRunning: false,
    })
  );
}


// =========================================================
// SANITIZE PROJECT
// =========================================================

function sanitizeProject(
  value: unknown
): ModelMindProject | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const project =
    value as Partial<ModelMindProject>;

  if (
    typeof project.id !== "string" ||
    typeof project.name !== "string"
  ) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    version:
      MODELMIND_PROJECT_VERSION,

    id: project.id,

    name:
      project.name.trim() ||
      DEFAULT_PROJECT_NAME,

    createdAt:
      typeof project.createdAt ===
      "string"
        ? project.createdAt
        : now,

    updatedAt:
      typeof project.updatedAt ===
      "string"
        ? project.updatedAt
        : now,

    cells:
      sanitizeCells(
        project.cells
      ),

    uploadedFiles:
      Array.isArray(
        project.uploadedFiles
      )
        ? project.uploadedFiles
        : [],

    experimentIds:
      Array.isArray(
        project.experimentIds
      )
        ? project.experimentIds.filter(
            (
              id: unknown
            ): id is string =>
              typeof id === "string"
          )
        : [],
  };
}


// =========================================================
// LOAD COMPLETE PROJECT STORE
// =========================================================

export function loadProjectStore():
  ProjectStore {
  if (!canUseStorage()) {
    return createEmptyStore();
  }

  try {
    const raw =
      window.localStorage.getItem(
        PROJECT_STORAGE_KEY
      );

    if (!raw) {
      return createEmptyStore();
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return createEmptyStore();
    }

    const parsedStore =
      parsed as Partial<ProjectStore>;

    const rawProjects =
      Array.isArray(
        parsedStore.projects
      )
        ? parsedStore.projects
        : [];

    const projects:
      ModelMindProject[] =
        rawProjects
          .map(
            (
              project: unknown
            ) =>
              sanitizeProject(
                project
              )
          )
          .filter(
            (
              project:
                ModelMindProject | null
            ): project is ModelMindProject =>
              project !== null
          );

    const requestedActive =
      typeof parsedStore.activeProjectId ===
      "string"
        ? parsedStore.activeProjectId
        : null;

    const activeExists =
      projects.some(
        (
          project:
            ModelMindProject
        ) =>
          project.id ===
          requestedActive
      );

    return {
      version:
        MODELMIND_PROJECT_VERSION,

      activeProjectId:
        activeExists
          ? requestedActive
          : projects[0]?.id ??
            null,

      projects,
    };
  } catch (error) {
    console.error(
      "Could not load ModelMind projects:",
      error
    );

    return createEmptyStore();
  }
}


// =========================================================
// SAVE COMPLETE PROJECT STORE
// =========================================================

export function saveProjectStore(
  store: ProjectStore
): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(store)
    );

    return true;
  } catch (error) {
    console.error(
      "Could not save ModelMind projects:",
      error
    );

    return false;
  }
}


// =========================================================
// ENSURE ACTIVE PROJECT EXISTS
// =========================================================

export function ensureActiveProject(): {
  store: ProjectStore;
  project: ModelMindProject;
} {
  const existing =
    loadProjectStore();

  if (
    existing.activeProjectId
  ) {
    const active =
      existing.projects.find(
        (
          project:
            ModelMindProject
        ) =>
          project.id ===
          existing.activeProjectId
      );

    if (active) {
      return {
        store: existing,
        project: active,
      };
    }
  }

  const project =
    createProject();

  const store: ProjectStore = {
    version:
      MODELMIND_PROJECT_VERSION,

    activeProjectId:
      project.id,

    projects: [
      ...existing.projects,
      project,
    ],
  };

  saveProjectStore(store);

  return {
    store,
    project,
  };
}


// =========================================================
// SAVE SINGLE PROJECT
// =========================================================

export function saveProject(
  project: ModelMindProject
): boolean {
  const store =
    loadProjectStore();

  const updatedProject:
    ModelMindProject = {
    ...project,

    version:
      MODELMIND_PROJECT_VERSION,

    updatedAt:
      new Date().toISOString(),
  };

  const exists =
    store.projects.some(
      (
        item: ModelMindProject
      ) =>
        item.id ===
        updatedProject.id
    );

  const projects:
    ModelMindProject[] =
      exists
        ? store.projects.map(
            (
              item:
                ModelMindProject
            ) =>
              item.id ===
              updatedProject.id
                ? updatedProject
                : item
          )
        : [
            ...store.projects,
            updatedProject,
          ];

  return saveProjectStore({
    ...store,

    activeProjectId:
      updatedProject.id,

    projects,
  });
}


// =========================================================
// SET ACTIVE PROJECT
// =========================================================

export function setActiveProject(
  projectId: string
): boolean {
  const store =
    loadProjectStore();

  const exists =
    store.projects.some(
      (
        project:
          ModelMindProject
      ) =>
        project.id ===
        projectId
    );

  if (!exists) {
    return false;
  }

  return saveProjectStore({
    ...store,

    activeProjectId:
      projectId,
  });
}


// =========================================================
// GET PROJECT
// =========================================================

export function getProject(
  projectId: string
): ModelMindProject | null {
  return (
    loadProjectStore()
      .projects
      .find(
        (
          project:
            ModelMindProject
        ) =>
          project.id ===
          projectId
      ) ?? null
  );
}


// =========================================================
// GET RECENT PROJECTS
// =========================================================

export function getRecentProjects():
  ProjectSummary[] {
  return loadProjectStore()
    .projects
    .slice()
    .sort(
      (
        a: ModelMindProject,
        b: ModelMindProject
      ) =>
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
    )
    .map(
      (
        project:
          ModelMindProject
      ): ProjectSummary => ({
        id: project.id,

        name:
          project.name,

        createdAt:
          project.createdAt,

        updatedAt:
          project.updatedAt,
      })
    );
}


// =========================================================
// RENAME PROJECT
// =========================================================

export function renameProject(
  projectId: string,
  name: string
): ModelMindProject | null {
  const project =
    getProject(projectId);

  if (!project) {
    return null;
  }

  const updated:
    ModelMindProject = {
    ...project,

    name:
      name.trim() ||
      DEFAULT_PROJECT_NAME,

    updatedAt:
      new Date().toISOString(),
  };

  saveProject(updated);

  return updated;
}


// =========================================================
// DUPLICATE PROJECT / SAVE AS
// =========================================================

export function duplicateProject(
  projectId: string,
  newName?: string
): ModelMindProject | null {
  const original =
    getProject(projectId);

  if (!original) {
    return null;
  }

  const now =
    new Date().toISOString();

  const duplicate:
    ModelMindProject = {
    ...original,

    id: createId(),

    name:
      newName?.trim() ||
      `${original.name} Copy`,

    createdAt: now,
    updatedAt: now,

    cells:
      original.cells.map(
        (
          cell:
            NotebookCellType
        ): NotebookCellType => ({
          ...cell,

          id: createId(),

          isRunning: false,
        })
      ),

    // A duplicated notebook begins
    // with its own experiment history.
    experimentIds: [],
  };

  saveProject(duplicate);

  return duplicate;
}


// =========================================================
// DELETE PROJECT
// =========================================================

export function deleteProject(
  projectId: string
): boolean {
  const store =
    loadProjectStore();

  const projects:
    ModelMindProject[] =
      store.projects.filter(
        (
          project:
            ModelMindProject
        ) =>
          project.id !==
          projectId
      );

  const activeProjectId =
    store.activeProjectId ===
    projectId
      ? projects[0]?.id ??
        null
      : store.activeProjectId;

  return saveProjectStore({
    ...store,

    activeProjectId,

    projects,
  });
}