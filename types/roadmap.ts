// =========================================================
// MODELMIND PERSONALISED ROADMAP TYPES
// =========================================================


// ---------------------------------------------------------
// LEARNING GOAL
// What is the learner preparing for?
// ---------------------------------------------------------

export type RoadmapGoal =
  | "college"
  | "ml-engineer"
  | "data-scientist"
  | "data-analyst"
  | "ai-engineer"
  | "deep-learning"
  | "placement"
  | "hackathon"
  | "project"
  | "custom";


// ---------------------------------------------------------
// CURRENT KNOWLEDGE LEVEL
// ---------------------------------------------------------

export type LearningLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

// ---------------------------------------------------------
// TOPIC DIFFICULTY
// ---------------------------------------------------------

export type TopicDifficulty =
  | "basic"
  | "intermediate"
  | "advanced";


// ---------------------------------------------------------
// ROADMAP ITEM STATUS
// ---------------------------------------------------------

export type RoadmapStatus =
  | "locked"
  | "available"
  | "in-progress"
  | "completed"
  | "revision";


// ---------------------------------------------------------
// LEARNING ACTIVITY
// ---------------------------------------------------------

export type ActivityType =
  | "concept"
  | "visualization"
  | "coding"
  | "practice"
  | "assignment"
  | "quiz"
  | "revision"
  | "project";


// ---------------------------------------------------------
// DOMAIN KNOWLEDGE LEVEL
// Used for more precise roadmap personalization
// ---------------------------------------------------------

export type KnowledgeLevel =
  | "none"
  | "basic"
  | "intermediate"
  | "advanced";


// ---------------------------------------------------------
// LEARNING PRIORITY
// A learner can choose multiple priorities.
// ---------------------------------------------------------

export type LearningPriority =
  | "python"
  | "data-analysis"
  | "mathematics"
  | "ml-models"
  | "preprocessing"
  | "visualization"
  | "evaluation"
  | "projects"
  | "advanced-ml";


// ---------------------------------------------------------
// USER PROFILE
// ---------------------------------------------------------

export interface RoadmapProfile {
  goal: RoadmapGoal;

  level: LearningLevel;

  /*
   * These three dimensions make personalization more
   * precise than using one overall level alone.
   */
  pythonLevel: KnowledgeLevel;

  mathLevel: KnowledgeLevel;

  mlLevel: KnowledgeLevel;

  /*
   * Areas the learner especially wants ModelMind
   * to emphasize.
   */
  priorities: LearningPriority[];

  /*
   * Used internally for workload calculations.
   * It does not need to be displayed as minutes
   * throughout the learner-facing roadmap.
   */
  minutesPerDay: number;

  /*
   * Target roadmap duration.
   */
  durationWeeks: number;

  customGoal?: string;
}


// ---------------------------------------------------------
// SKILL
// Example: Python, Pandas, Regression, Pipeline
// ---------------------------------------------------------

export interface RoadmapSkill {
  id: string;

  name: string;

  category: string;

  description: string;

  prerequisites: string[];

  difficulty: TopicDifficulty;

  estimatedMinutes: number;
}


// ---------------------------------------------------------
// ACTIVITY
// Small learning task inside a topic
// ---------------------------------------------------------

export interface RoadmapActivity {
  id: string;

  title: string;

  type: ActivityType;

  estimatedMinutes: number;

  completed: boolean;

  /**
   * Stores individual completed practice problems.
   *
   * Example:
   * ["python-basics-practice-1", "python-basics-practice-2"]
   *
   * This allows practice progress such as 2/5 or 3/5
   * to survive page refreshes.
   */
  completedProblemIds?: string[];
}

// ---------------------------------------------------------
// TOPIC
// Example: Missing Values
// ---------------------------------------------------------

export interface RoadmapTopic {
  id: string;

  title: string;

  description: string;

  category: string;

  difficulty: TopicDifficulty;

  prerequisites: string[];

  activities: RoadmapActivity[];

  estimatedMinutes: number;

  masteryScore: number;

  status: RoadmapStatus;
}


// ---------------------------------------------------------
// ASSIGNMENT
// ---------------------------------------------------------

export interface RoadmapAssignment {
  id: string;

  title: string;

  description: string;

  topicIds: string[];

  difficulty: TopicDifficulty;

  estimatedMinutes: number;

  instructions: string[];

  hints: string[];

  completed: boolean;

  completedTaskIndexes?: number[];

  score?: number;
}


// ---------------------------------------------------------
// QUIZ QUESTION
// ---------------------------------------------------------

export interface RoadmapQuizQuestion {
  id: string;

  question: string;

  options: string[];

  correctAnswer: number;

  explanation: string;
}


// ---------------------------------------------------------
// QUIZ
// ---------------------------------------------------------

export interface RoadmapQuiz {
  id: string;

  title: string;

  topicIds: string[];

  questions: RoadmapQuizQuestion[];

  completed: boolean;

  score?: number;
}


// ---------------------------------------------------------
// DAILY ROADMAP
// ---------------------------------------------------------

export interface RoadmapDay {
  id: string;

  dayNumber: number;

  title: string;

  topics: RoadmapTopic[];

  assignment?: RoadmapAssignment;

  quiz?: RoadmapQuiz;

  estimatedMinutes: number;

  completed: boolean;

  isRevisionDay: boolean;
}


// ---------------------------------------------------------
// ROADMAP WEEK
// ---------------------------------------------------------

export interface RoadmapWeek {
  id: string;

  weekNumber: number;

  title: string;

  description: string;

  days: RoadmapDay[];

  completed: boolean;
}


// ---------------------------------------------------------
// MASTERY
// We don't calculate mastery using only a quiz.
// ---------------------------------------------------------

export interface MasteryBreakdown {
  conceptScore: number;

  codingScore: number;

  assignmentScore: number;

  quizScore: number;

  debuggingScore: number;

  overallScore: number;
}


// ---------------------------------------------------------
// SKILL ASSESSMENT
// ---------------------------------------------------------

export interface SkillAssessment {
  skillId: string;

  score: number;

  mastery: MasteryBreakdown;

  assessedAt: string;
}


// ---------------------------------------------------------
// ROADMAP PROJECT
// ---------------------------------------------------------

export interface RoadmapProject {
  id: string;

  title: string;

  description: string;

  difficulty: TopicDifficulty;

  requiredSkills: string[];

  objectives: string[];

  estimatedMinutes: number;

  completed: boolean;

  score?: number;
}


// ---------------------------------------------------------
// COMPLETE PERSONALISED ROADMAP
// ---------------------------------------------------------
// =========================================================
// WEAK TOPIC RECOVERY
// =========================================================

export type WeakTopicRecoveryStatus =
  | "needs-practice"
  | "relearn"
  | "recovered";


export type WeakTopicWeakArea =
  | "concept"
  | "coding"
  | "assignment"
  | "quiz"
  | "debugging";


export interface WeakTopicAttempt {
  score: number;

  attemptedAt: string;
}


export interface WeakTopicRecord {
  id: string;

  skillId: string;

  topicTitle: string;

  dayId: string;

  dayNumber: number;

  /*
   * Score that originally caused the
   * topic to enter recovery.
   */
  initialScore: number;

  /*
   * Most recent checkpoint score.
   */
  latestScore: number;

  /*
   * Best checkpoint result achieved
   * during the recovery process.
   */
  bestScore: number;

  status: WeakTopicRecoveryStatus;

  /*
   * Initially this will normally contain
   * "quiz", because checkpoint accuracy is
   * our first genuine performance signal.
   *
   * Later ModelMind can add concept,
   * coding, assignment and debugging
   * evidence here.
   */
  weakAreas: WeakTopicWeakArea[];

  attempts: WeakTopicAttempt[];

  recoveryStarted: boolean;

  recoveryStartedAt?: string;

  recoveredAt?: string;

  createdAt: string;

  updatedAt: string;
}
export interface PersonalizedRoadmapData {
  id: string;

  name: string;

  profile: RoadmapProfile;

  weeks: RoadmapWeek[];

  projects: RoadmapProject[];

  assessments: SkillAssessment[];
  weakTopics: WeakTopicRecord[];

  overallProgress: number;

  currentDay: number;

  totalDays: number;

  createdAt: string;

  updatedAt: string;
}
// =========================================================
// DEEP LEARNING CONTENT SYSTEM
// Used by the Day Learning Workspace
// =========================================================


// ---------------------------------------------------------
// LESSON VISUALIZATION
//
// model-lab:
// Connect to an existing ModelMind ML Model Lab later.
//
// native:
// Smaller interactive visualization built specifically
// for foundation concepts such as NumPy, Pandas,
// statistics, preprocessing, etc.
//
// none:
// No visualization is required for this lesson.
// ---------------------------------------------------------

export type LessonVisualizationType =
  | "model-lab"
  | "native"
  | "none";


export interface LessonVisualization {
  type: LessonVisualizationType;

  title: string;

  description: string;

  /*
   * Identifier of an existing ModelMind Model Lab.
   *
   * Example:
   * gradient-descent
   * linear-regression
   * decision-tree
   *
   * We will connect these IDs to the main
   * ModelMind application later.
   */
  labId?: string;

  /*
   * Identifier for a smaller roadmap-native
   * visualization when type === "native".
   */
  visualizationId?: string;
}


// ---------------------------------------------------------
// LESSON EXAMPLE
// ---------------------------------------------------------

export interface LessonExample {
  id: string;

  title: string;

  explanation: string;

  code?: string;

  language?: string;

  output?: string;

  importantPoints?: string[];
}


// ---------------------------------------------------------
// MATHEMATICS
// Optional because not every topic needs mathematics.
// ---------------------------------------------------------

export interface LessonMathematics {
  title?: string;

  explanation: string;

  formula?: string;

  variables?: {
    symbol: string;

    meaning: string;
  }[];

  example?: string;
}


// ---------------------------------------------------------
// LESSON SECTION
//
// A lesson can contain multiple sections:
//
// What is Linear Regression?
// Intuition
// How it works
// Cost function
// Gradient descent
// etc.
// ---------------------------------------------------------

export interface LessonSection {
  id: string;

  title: string;

  explanation: string[];

  intuition?: string[];

  importantPoints?: string[];

  mathematics?: LessonMathematics;

  examples?: LessonExample[];
}


// ---------------------------------------------------------
// CODE EXAMPLE
// Separate from small examples inside explanations.
//
// These are intended for the dedicated Code stage
// of the Day Learning Workspace.
// ---------------------------------------------------------

export interface LessonCodeExample {
  id: string;

  title: string;

  description: string;

  language: string;

  code: string;

  explanation: string[];

  expectedOutput?: string;

  commonMistakes?: string[];
}


// ---------------------------------------------------------
// PRACTICE PROBLEM
// ---------------------------------------------------------

export type PracticeDifficulty =
  | "basic"
  | "medium"
  | "advanced";


export type PracticeType =
  | "concept"
  | "coding"
  | "debugging"
  | "output"
  | "analysis";


export interface LessonPracticeProblem {
  id: string;

  title: string;

  type: PracticeType;

  difficulty: PracticeDifficulty;

  question: string;

  instructions?: string[];

  starterCode?: string;

  hints?: string[];

  solution?: string;

  explanation?: string;
}


// ---------------------------------------------------------
// COMMON MISTAKE
// ---------------------------------------------------------

export interface LessonCommonMistake {
  id: string;

  title: string;

  description: string;

  correction: string;
}

// =========================================================
// ADVANCED EDUCATIONAL CONTENT
//
// IMPORTANT:
// These interfaces contain lesson knowledge only.
// They must never store learner progress, completion,
// quiz attempts, assignment state, mastery state,
// or persistence information.
// =========================================================

export type LessonContentDepth =
  | "foundation"
  | "detailed"
  | "deep"
  | "expert";


export interface LessonAlgorithmStep {
  id: string;

  step: number;

  title: string;

  explanation: string;

  intuition?: string;

  mathematics?: string;

  example?: string;

  importantPoints?: string[];
}


export interface LessonAssumption {
  id: string;

  title: string;

  explanation: string;

  whyItMatters?: string;

  violationEffect?: string;

  howToCheck?: string[];

  remedies?: string[];
}


export interface LessonParameter {
  id: string;

  name: string;

  displayName?: string;

  category?:
    | "core"
    | "regularization"
    | "optimization"
    | "sampling"
    | "tree-structure"
    | "distance"
    | "probability"
    | "performance"
    | "implementation"
    | "other";

  description: string;

  intuition: string;

  /*
   * Library default represented as educational text.
   *
   * Example:
   * "1.0"
   * "\"lbfgs\""
   * "None"
   */
  defaultValue?: string;

  acceptedValues?: string;

  mathematicalMeaning?: string;

  lowValueEffect?: string[];

  highValueEffect?: string[];

  biasEffect?: string;

  varianceEffect?: string;

  overfittingEffect?: string;

  underfittingEffect?: string;

  computationalEffect?: string;

  memoryEffect?: string;

  whenToIncrease?: string[];

  whenToDecrease?: string[];

  whenToTune?: string[];

  whenNotToTune?: string[];

  tuningStrategy?: string[];

  recommendedValues?: string[];

  interactions?: {
    parameter: string;

    explanation: string;
  }[];

  examples?: LessonExample[];

  commonMistakes?: string[];

  examNotes?: string[];

  interviewNotes?: string[];
}


export interface LessonObjectiveFunction {
  name: string;

  purpose: string;

  intuition: string[];

  formula?: string;

  variables?: {
    symbol: string;

    meaning: string;
  }[];

  explanation?: string[];

  optimizationGoal?:
    | "minimize"
    | "maximize";

  practicalMeaning?: string[];
}


export interface LessonDataRequirement {
  scaling?: {
    required: boolean;

    explanation: string;
  };

  categoricalFeatures?: {
    supportedDirectly: boolean;

    explanation: string;

    recommendations?: string[];
  };

  missingValues?: {
    supportedDirectly: boolean;

    explanation: string;

    recommendations?: string[];
  };

  outliers?: {
    sensitivity:
      | "low"
      | "medium"
      | "high";

    explanation: string;

    recommendations?: string[];
  };

  imbalance?: {
    sensitivity:
      | "low"
      | "medium"
      | "high";

    explanation: string;

    recommendations?: string[];
  };

  featureDistribution?: string[];

  sampleSizeConsiderations?: string[];

  dimensionalityConsiderations?: string[];
}


export interface LessonComplexity {
  training?: string;

  prediction?: string;

  memory?: string;

  explanation?: string[];

  scalabilityNotes?: string[];
}


export interface LessonBiasVariance {
  bias:
    | "low"
    | "medium"
    | "high"
    | "depends";

  variance:
    | "low"
    | "medium"
    | "high"
    | "depends";

  explanation: string[];

  underfittingCauses?: string[];

  overfittingCauses?: string[];

  reduceUnderfitting?: string[];

  reduceOverfitting?: string[];
}


export interface LessonModelComparison {
  model: string;

  relationship?: string;

  similarities?: string[];

  differences: string[];

  preferCurrentWhen?: string[];

  preferOtherWhen?: string[];

  examTip?: string;
}


export interface LessonEvaluationGuide {
  problemType:
    | "regression"
    | "classification"
    | "clustering"
    | "dimensionality-reduction"
    | "anomaly-detection"
    | "other";

  recommendedMetrics: {
    metric: string;

    why: string;

    caution?: string;
  }[];

  validationStrategy?: string[];

  diagnosticChecks?: string[];

  misleadingMetrics?: string[];
}


export interface LessonTuningGuide {
  strategy: string[];

  tuneFirst?: string[];

  tuneLater?: string[];

  searchSpaceTips?: string[];

  parameterInteractions?: string[];

  gridSearchExample?: string;

  randomizedSearchExample?: string;

  practicalWorkflow?: string[];
}


export interface LessonFailureMode {
  id: string;

  symptom: string;

  likelyCauses: string[];

  diagnosis?: string[];

  fixes: string[];
}


export interface LessonRealWorldApplication {
  title: string;

  domain: string;

  problem: string;

  whyModelFits?: string;

  limitations?: string[];
}


export interface LessonInterviewQuestion {
  question: string;

  shortAnswer: string;

  deepAnswer?: string[];

  followUpQuestions?: string[];
}


export interface LessonExamNote {
  title: string;

  points: string[];

  formula?: string;

  commonQuestion?: string;
}


// =========================================================
// ML MODEL DEEP-DIVE CONTENT
//
// This is intentionally optional inside LessonContent.
// Existing non-model lessons therefore remain compatible.
// =========================================================

export interface MLModelDeepDive {
  modelFamily: string;

  problemTypes: string[];

  depth: LessonContentDepth;

  motivation: string[];

  intuition: string[];

  /*
   * Explain how the model "thinks" without
   * requiring mathematics first.
   */
  mentalModel?: string[];

  /*
   * Training procedure from input data to
   * fitted model.
   */
  trainingProcess: LessonAlgorithmStep[];

  /*
   * What happens when predict() or an
   * equivalent operation is performed.
   */
  predictionProcess?: LessonAlgorithmStep[];

  mathematics?: LessonMathematics[];

  objectiveFunctions?: LessonObjectiveFunction[];

  assumptions?: LessonAssumption[];

  parameters: LessonParameter[];

  dataRequirements?: LessonDataRequirement;

  biasVariance?: LessonBiasVariance;

  complexity?: LessonComplexity;

  advantages: string[];

  limitations: string[];

  whenToUse: string[];

  whenNotToUse: string[];

  evaluation?: LessonEvaluationGuide;

  tuning?: LessonTuningGuide;

  comparisons?: LessonModelComparison[];

  failureModes?: LessonFailureMode[];

  realWorldApplications?: LessonRealWorldApplication[];

  interviewQuestions?: LessonInterviewQuestion[];

  examNotes?: LessonExamNote[];
}
// ---------------------------------------------------------
// COMPLETE LESSON
//
// One curriculum skill can have one deep lesson.
//
// Example:
// skillId: "linear-regression"
// ---------------------------------------------------------

export interface LessonContent {
  id: string;

  skillId: string;

  title: string;

  subtitle?: string;

  overview: string;

  objectives: string[];

  prerequisites?: string[];

  sections: LessonSection[];

  visualization?: LessonVisualization;

  codeExamples: LessonCodeExample[];

  practice: LessonPracticeProblem[];

  commonMistakes: LessonCommonMistake[];

  keyTakeaways: string[];

  /*
   * These are learning recommendations only.
   * They do NOT lock other roadmap days.
   */
  nextTopics?: string[];
    /*
   * Controls how deeply this lesson is intended
   * to teach the topic.
   */
  contentDepth?: LessonContentDepth;

  /*
   * Full model-specific knowledge layer.
   *
   * Only ML-model lessons need this.
   * Python, Pandas, EDA, preprocessing, etc.
   * can continue using the normal lesson system.
   */
  modelDeepDive?: MLModelDeepDive;

  /*
   * Additional long-form educational material
   * that is useful outside model-specific lessons.
   */
  assumptions?: LessonAssumption[];

  realWorldApplications?: LessonRealWorldApplication[];

  interviewQuestions?: LessonInterviewQuestion[];

  examNotes?: LessonExamNote[];
}