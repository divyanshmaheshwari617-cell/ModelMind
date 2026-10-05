export type NativeVisualizationFamily =
  | "python"
  | "data"
  | "statistics"
  | "preprocessing"
  | "evaluation"
  | "workflow";

export interface VisualizationConcept {
  title: string;
  explanation: string;
}

export interface VisualizationFormula {
  name: string;
  formula: string;
  explanation: string;
}

export interface VisualizationObservation {
  title: string;
  description: string;
}

export interface VisualizationChallenge {
  question: string;
  hint: string;
  answer: string;
}

export interface NativeVisualizationContent {
  id: string;

  family: NativeVisualizationFamily;

  title: string;

  subtitle: string;

  concept: string;

  whyItMatters: string;

  learningObjectives: string[];

  concepts: VisualizationConcept[];

  formulas?: VisualizationFormula[];

  observations: VisualizationObservation[];

  commonMistakes: string[];

  challenges: VisualizationChallenge[];

  keyInsight: string;
}

/* =========================================================
   PYTHON
   ========================================================= */

const pythonExecutionFlow: NativeVisualizationContent = {
  id: "python-execution-flow-explorer",

  family: "python",

  title: "Python Execution Flow Explorer",

  subtitle:
    "Watch Python execute a program one statement at a time and observe how variables, memory and output change.",

  concept:
    "Python executes most ordinary statements sequentially. During execution, names are bound to objects, expressions are evaluated, functions may be called, and output is produced. Understanding this execution model makes debugging much easier.",

  whyItMatters:
    "Many programming mistakes come from mentally executing code in the wrong order. If you can trace a program statement by statement, you can predict values, understand errors and debug ML preprocessing code more effectively.",

  learningObjectives: [
    "Understand sequential execution.",
    "Track variable values while a program runs.",
    "Distinguish an expression from assignment and output.",
    "Understand how reassignment changes a variable binding.",
    "Predict program output before running the program.",
  ],

  concepts: [
    {
      title: "Assignment",
      explanation:
        "An assignment evaluates the expression on the right side and binds the resulting object to the name on the left side.",
    },
    {
      title: "Expression evaluation",
      explanation:
        "Python evaluates operators and expressions before storing or using their result.",
    },
    {
      title: "Variable state",
      explanation:
        "The current values associated with variables form part of the program state. This state changes as statements execute.",
    },
    {
      title: "Output",
      explanation:
        "A value existing in memory is different from a value being displayed. print() explicitly sends a representation of a value to the output.",
    },
  ],

  observations: [
    {
      title: "Execution order matters",
      description:
        "A variable cannot normally be used before the statement that defines it has executed.",
    },
    {
      title: "Reassignment changes state",
      description:
        "Executing x = x + 1 reads the previous value of x, computes a new value and binds x to the result.",
    },
    {
      title: "Memory and output are different",
      description:
        "Variables can exist and change without anything being printed.",
    },
  ],

  commonMistakes: [
    "Reading the code as if every line happens simultaneously.",
    "Assuming assignment means mathematical equality.",
    "Expecting every evaluated value to automatically appear as output.",
    "Forgetting that a later assignment can replace the value associated with a name.",
  ],

  challenges: [
    {
      question:
        "If x = 5, then y = x + 3, then x = 10, what is y?",
      hint:
        "Think about the value of x at the moment y is assigned.",
      answer:
        "y remains 8. Reassigning x later does not recompute the earlier integer expression used to create y.",
    },
    {
      question:
        "Why does print(x) produce output while x = 10 normally does not?",
      hint:
        "Assignment and output are different operations.",
      answer:
        "x = 10 changes program state. print(x) explicitly sends the current value to the output stream.",
    },
  ],

  keyInsight:
    "Debugging becomes much easier when you stop looking at a program as static text and start tracing how its state changes one statement at a time.",
};

const pythonDataStructures: NativeVisualizationContent = {
  id: "python-data-structure-explorer",

  family: "python",

  title: "Python Data Structure Explorer",

  subtitle:
    "Compare lists, tuples, dictionaries and sets through their structure, behavior and common ML use cases.",

  concept:
    "Python provides several built-in containers because different problems require different ways of organizing data. Choosing the correct structure improves clarity and often improves efficiency.",

  whyItMatters:
    "ML programs constantly manipulate collections: feature names, rows, configuration values, labels, mappings and unique categories. Understanding Python containers is foundational for NumPy, Pandas and scikit-learn.",

  learningObjectives: [
    "Differentiate list, tuple, dictionary and set.",
    "Understand ordering and mutability.",
    "Understand key-value lookup.",
    "Recognize when uniqueness matters.",
    "Choose an appropriate structure for a programming problem.",
  ],

  concepts: [
    {
      title: "List",
      explanation:
        "An ordered mutable sequence. Lists are useful when values need to be stored in order and modified.",
    },
    {
      title: "Tuple",
      explanation:
        "An ordered immutable sequence. Tuples are useful when a small collection should not be modified accidentally.",
    },
    {
      title: "Dictionary",
      explanation:
        "A mapping from keys to values. Dictionaries are useful for configuration, lookup and structured records.",
    },
    {
      title: "Set",
      explanation:
        "A collection designed around unique elements and membership operations.",
    },
  ],

  observations: [
    {
      title: "Index versus key",
      description:
        "Lists and tuples are commonly accessed by position, while dictionaries are accessed through keys.",
    },
    {
      title: "Mutability matters",
      description:
        "Lists and dictionaries can be modified in place, while tuples cannot be modified in the same way.",
    },
    {
      title: "Sets remove duplicates",
      description:
        "Converting repeated categorical values to a set can reveal the unique categories.",
    },
  ],

  commonMistakes: [
    "Using a list when a key-value mapping would be clearer.",
    "Expecting sets to behave like indexed lists.",
    "Trying to modify a tuple as if it were a list.",
    "Using mutable structures without considering unintended modification.",
  ],

  challenges: [
    {
      question:
        "Which structure would you use to map a model name to its accuracy?",
      hint:
        "You want model names to act as lookup keys.",
      answer:
        "A dictionary, for example {'logistic': 0.91, 'svm': 0.93}.",
    },
    {
      question:
        "Which structure is useful for finding unique class labels?",
      hint:
        "Think about a container whose elements are unique.",
      answer:
        "A set is a natural choice when the main goal is uniqueness.",
    },
  ],

  keyInsight:
    "Choose a data structure based on the operations you need, not simply because one structure is familiar.",
};

const pythonFunctionFlow: NativeVisualizationContent = {
  id: "python-function-call-explorer",

  family: "python",

  title: "Function Call Explorer",

  subtitle:
    "Trace arguments, parameters, local variables and return values through a Python function call.",

  concept:
    "A function packages reusable behavior. Calling a function creates an execution context in which arguments are associated with parameters, statements execute and an optional result is returned.",

  whyItMatters:
    "Functions are essential for reusable preprocessing, evaluation and ML pipelines. Understanding function calls also makes stack traces and debugging easier to understand.",

  learningObjectives: [
    "Differentiate parameters and arguments.",
    "Understand local function state.",
    "Understand return values.",
    "Trace a function call from input to output.",
    "Recognize the value of reusable functions.",
  ],

  concepts: [
    {
      title: "Parameters",
      explanation:
        "Parameters are names declared in the function definition.",
    },
    {
      title: "Arguments",
      explanation:
        "Arguments are the values supplied when the function is called.",
    },
    {
      title: "Local scope",
      explanation:
        "Variables created inside a function normally belong to that function's local scope.",
    },
    {
      title: "Return",
      explanation:
        "return ends the function call and sends a value back to the caller.",
    },
  ],

  observations: [
    {
      title: "Functions transform inputs",
      description:
        "A useful mental model is input → computation → returned result.",
    },
    {
      title: "Local state is isolated",
      description:
        "Temporary variables inside a function help prevent unrelated code from depending on implementation details.",
    },
  ],

  commonMistakes: [
    "Confusing print with return.",
    "Confusing arguments with parameters.",
    "Expecting a local variable to always exist outside the function.",
    "Writing repeated code instead of extracting reusable behavior.",
  ],

  challenges: [
    {
      question:
        "What is returned by def square(x): return x * x when called with square(4)?",
      hint:
        "Substitute the argument into the parameter.",
      answer:
        "16.",
    },
    {
      question:
        "Why is return usually more reusable than only printing a result?",
      hint:
        "Think about whether another part of the program can use the result.",
      answer:
        "A returned value can be assigned, transformed or passed to another function, while printing primarily displays it.",
    },
  ],

  keyInsight:
    "Think of a function as a small machine with defined inputs, internal processing and a clearly defined output.",
};

const pythonDataPipeline: NativeVisualizationContent = {
  id: "python-data-processing-pipeline",

  family: "python",

  title: "Python Data Processing Pipeline",

  subtitle:
    "Follow raw data through loading, validation, transformation and analysis.",

  concept:
    "Real data work is rarely a single operation. Data normally passes through a sequence of transformations before it becomes suitable for analysis or machine learning.",

  whyItMatters:
    "Thinking in pipelines prevents tangled code and makes it easier to identify where incorrect values were introduced.",

  learningObjectives: [
    "Understand sequential data transformations.",
    "Separate loading from cleaning.",
    "Separate transformation from analysis.",
    "Recognize intermediate data states.",
  ],

  concepts: [
    {
      title: "Input",
      explanation:
        "Data enters the program from a file, API, database or another source.",
    },
    {
      title: "Validation",
      explanation:
        "Before analysis, verify expected columns, types, ranges and missing values.",
    },
    {
      title: "Transformation",
      explanation:
        "Data may be filtered, converted, aggregated or otherwise transformed.",
    },
    {
      title: "Output",
      explanation:
        "The processed result can feed visualization, statistical analysis or an ML pipeline.",
    },
  ],

  observations: [
    {
      title: "Intermediate states matter",
      description:
        "Inspecting data after important transformations makes bugs easier to locate.",
    },
    {
      title: "Order matters",
      description:
        "Changing the order of filtering, aggregation and transformation can change the final result.",
    },
  ],

  commonMistakes: [
    "Performing many transformations without inspecting intermediate results.",
    "Mixing data loading, cleaning and modeling into one large block.",
    "Assuming input data is always valid.",
  ],

  challenges: [
    {
      question:
        "Should schema validation happen before or after training a model?",
      hint:
        "Consider when malformed data should be discovered.",
      answer:
        "Before training. Invalid inputs should be detected before they contaminate later stages.",
    },
  ],

  keyInsight:
    "Reliable ML code is easier to build when data processing is treated as a sequence of explicit, inspectable stages.",
};

const pythonExceptionFlow: NativeVisualizationContent = {
  id: "python-exception-flow-explorer",

  family: "python",

  title: "Python Exception Flow Explorer",

  subtitle:
    "Trace how Python moves from normal execution into exception handling.",

  concept:
    "Exceptions represent abnormal execution conditions. try/except lets a program handle expected failures deliberately rather than terminating immediately.",

  whyItMatters:
    "Data pipelines encounter missing files, invalid values, malformed inputs and library errors. Understanding exceptions is necessary for reliable software and useful debugging.",

  learningObjectives: [
    "Understand try and except.",
    "Trace control flow when an exception occurs.",
    "Differentiate expected error handling from hiding bugs.",
    "Understand finally at a conceptual level.",
  ],

  concepts: [
    {
      title: "try",
      explanation:
        "The try block contains code that may raise an exception.",
    },
    {
      title: "raise",
      explanation:
        "When an exceptional condition occurs, normal control flow is interrupted.",
    },
    {
      title: "except",
      explanation:
        "A matching except block can handle the exception.",
    },
    {
      title: "finally",
      explanation:
        "A finally block is designed for cleanup that should run whether an exception occurred or not.",
    },
  ],

  observations: [
    {
      title: "Exceptions change control flow",
      description:
        "After an exception is raised, remaining statements in that try path are skipped until an appropriate handler is reached.",
    },
    {
      title: "Specific handling is clearer",
      description:
        "Handling expected exception types is generally more informative than silently catching every possible error.",
    },
  ],

  commonMistakes: [
    "Using except without understanding which error is expected.",
    "Silently ignoring exceptions.",
    "Using exception handling to hide programming mistakes.",
  ],

  challenges: [
    {
      question:
        "If int('abc') executes inside a try block, what happens?",
      hint:
        "'abc' cannot be interpreted as an integer.",
      answer:
        "Python raises ValueError. A matching except ValueError block can handle it.",
    },
  ],

  keyInsight:
    "Exception handling should make failures understandable and recoverable, not invisible.",
};

const pythonOOP: NativeVisualizationContent = {
  id: "python-oop-object-explorer",

  family: "python",

  title: "Python Object Explorer",

  subtitle:
    "Explore the relationship between classes, objects, attributes and methods.",

  concept:
    "A class describes a reusable structure and behavior, while an object is an instance created from that class.",

  whyItMatters:
    "Most ML libraries expose models, transformers and pipelines as objects. Understanding object-oriented programming makes APIs such as scikit-learn much easier to reason about.",

  learningObjectives: [
    "Differentiate class and object.",
    "Understand attributes.",
    "Understand methods.",
    "Recognize object state.",
    "Relate OOP concepts to ML estimators.",
  ],

  concepts: [
    {
      title: "Class",
      explanation:
        "A class defines the structure and behavior shared by its instances.",
    },
    {
      title: "Object",
      explanation:
        "An object is a concrete instance of a class.",
    },
    {
      title: "Attribute",
      explanation:
        "An attribute stores state associated with an object.",
    },
    {
      title: "Method",
      explanation:
        "A method defines behavior associated with an object.",
    },
  ],

  observations: [
    {
      title: "Objects maintain state",
      description:
        "Calling methods can inspect or modify the state stored by an object.",
    },
    {
      title: "ML APIs are object-oriented",
      description:
        "A model object is configured, fitted and then used for prediction through methods.",
    },
  ],

  commonMistakes: [
    "Confusing a class definition with an object instance.",
    "Forgetting self when working with instance methods.",
    "Treating every variable as global rather than object state.",
  ],

  challenges: [
    {
      question:
        "In model = SomeModel(), what is SomeModel and what is model?",
      hint:
        "One defines the type; the other is created from it.",
      answer:
        "SomeModel is the class and model is an instance of that class.",
    },
  ],

  keyInsight:
    "Understanding objects explains why ML code often follows the pattern: create estimator → fit estimator → use estimator.",
};

const pythonGeneratorMemory: NativeVisualizationContent = {
  id: "python-generator-memory-explorer",

  family: "python",

  title: "Generator & Memory Explorer",

  subtitle:
    "Compare producing an entire collection at once with yielding values lazily.",

  concept:
    "A generator can produce values on demand rather than constructing every result in memory at the same time.",

  whyItMatters:
    "Large datasets and streaming workflows can exceed available memory. Lazy iteration helps process information incrementally.",

  learningObjectives: [
    "Understand eager versus lazy evaluation.",
    "Understand yield conceptually.",
    "Recognize memory advantages of generators.",
    "Identify suitable streaming use cases.",
  ],

  concepts: [
    {
      title: "Eager collection",
      explanation:
        "A complete collection such as a list is materialized in memory.",
    },
    {
      title: "Generator",
      explanation:
        "A generator produces the next value when iteration requests it.",
    },
    {
      title: "yield",
      explanation:
        "yield produces a value while preserving enough execution state to continue later.",
    },
  ],

  observations: [
    {
      title: "Memory scales differently",
      description:
        "Materializing millions of values requires storing them, while a generator can often work one item at a time.",
    },
    {
      title: "Generators are consumable",
      description:
        "Once values have been iterated, a generator may need to be recreated to iterate again.",
    },
  ],

  commonMistakes: [
    "Assuming a generator already contains every produced value.",
    "Trying to index a generator like a list.",
    "Forgetting that generators may be exhausted after iteration.",
  ],

  challenges: [
    {
      question:
        "Why might a generator be preferable when reading millions of records?",
      hint:
        "Think about how many records must exist in memory simultaneously.",
      answer:
        "It can process records incrementally instead of materializing the entire result at once.",
    },
  ],

  keyInsight:
    "Generators trade immediate materialization for incremental computation, which can dramatically reduce memory usage.",
};

/* =========================================================
   NUMPY + PANDAS
   ========================================================= */

const numpyBroadcasting: NativeVisualizationContent = {
  id: "numpy-array-broadcasting-explorer",

  family: "python",

  title: "NumPy Array & Broadcasting Explorer",

  subtitle:
    "Explore array shape, dimensions, vectorized operations and NumPy broadcasting.",

  concept:
    "NumPy arrays organize numerical data into dimensions. Broadcasting allows compatible shapes to participate in element-wise operations without manually duplicating data.",

  whyItMatters:
    "Nearly every ML workflow eventually relies on matrix or array operations. Understanding shape and broadcasting prevents some of the most common numerical-programming errors.",

  learningObjectives: [
    "Understand array shape.",
    "Differentiate scalar, vector and matrix.",
    "Understand element-wise operations.",
    "Understand broadcasting compatibility.",
    "Recognize vectorization benefits.",
  ],

  concepts: [
    {
      title: "Shape",
      explanation:
        "Shape describes the size of each dimension, such as (3,) for a vector or (2, 3) for a two-row matrix.",
    },
    {
      title: "Vectorization",
      explanation:
        "Operations can be applied to whole arrays without manually writing a Python loop for each element.",
    },
    {
      title: "Broadcasting",
      explanation:
        "NumPy can conceptually expand compatible dimensions so arrays of different shapes can interact element-wise.",
    },
  ],

  observations: [
    {
      title: "Shape controls compatibility",
      description:
        "Two arrays do not need identical shapes, but their dimensions must satisfy broadcasting rules.",
    },
    {
      title: "Broadcasting avoids unnecessary copies",
      description:
        "The conceptual expansion does not necessarily mean NumPy physically duplicates the smaller array.",
    },
  ],

  commonMistakes: [
    "Ignoring shape when debugging numerical code.",
    "Confusing matrix multiplication with element-wise multiplication.",
    "Assuming every pair of differently shaped arrays can broadcast.",
  ],

  challenges: [
    {
      question:
        "What happens conceptually when [1, 2, 3] is added to every row of a 2×3 matrix?",
      hint:
        "The vector matches the matrix's final dimension.",
      answer:
        "The vector is broadcast across the rows and added element-wise to each row.",
    },
  ],

  keyInsight:
    "When NumPy behaves unexpectedly, inspect the shapes first.",
};

const pandasOperations: NativeVisualizationContent = {
  id: "pandas-dataframe-operation-explorer",

  family: "data",

  title: "Pandas DataFrame Operation Explorer",

  subtitle:
    "Watch filtering, selection, sorting, grouping and aggregation transform a DataFrame.",

  concept:
    "A DataFrame represents tabular data with labeled rows and columns. Pandas operations create structured transformations of that data.",

  whyItMatters:
    "Data preparation usually consumes more effort than fitting the ML model itself. Pandas is one of the central tools for inspecting and preparing tabular datasets.",

  learningObjectives: [
    "Understand rows and columns.",
    "Select columns.",
    "Filter rows.",
    "Sort values.",
    "Group and aggregate records.",
  ],

  concepts: [
    {
      title: "Selection",
      explanation:
        "Selection chooses particular columns or rows without necessarily changing their values.",
    },
    {
      title: "Filtering",
      explanation:
        "Filtering retains rows satisfying a Boolean condition.",
    },
    {
      title: "Grouping",
      explanation:
        "groupby separates records into groups so each group can be aggregated.",
    },
    {
      title: "Aggregation",
      explanation:
        "Aggregation summarizes multiple values using operations such as mean, count, sum, min or max.",
    },
  ],

  observations: [
    {
      title: "Operations can be chained",
      description:
        "Complex analysis often consists of selection → filtering → grouping → aggregation.",
    },
    {
      title: "Columns have types",
      description:
        "Numeric, categorical, datetime and textual columns often require different operations.",
    },
  ],

  commonMistakes: [
    "Filtering with an incorrect Boolean condition.",
    "Ignoring missing values before aggregation.",
    "Confusing a Series with a DataFrame.",
    "Modifying data without checking the resulting shape.",
  ],

  challenges: [
    {
      question:
        "How would you conceptually find average salary for each department?",
      hint:
        "First create groups by department, then summarize salary.",
      answer:
        "Group by department and aggregate the salary column using mean.",
    },
  ],

  keyInsight:
    "Think of Pandas work as a transparent sequence of table transformations.",
};

/* =========================================================
   DATA CLEANING + EDA
   ========================================================= */

const dataCleaning: NativeVisualizationContent = {
  id: "data-cleaning-quality-explorer",

  family: "data",

  title: "Data Cleaning & Quality Explorer",

  subtitle:
    "Inspect missing values, duplicates, invalid values and inconsistent categories before modeling.",

  concept:
    "Data cleaning identifies and resolves quality problems that can distort analysis or cause ML pipelines to fail.",

  whyItMatters:
    "A sophisticated algorithm cannot compensate for incorrectly interpreted data. Cleaning decisions directly affect what the model learns.",

  learningObjectives: [
    "Detect missing values.",
    "Detect duplicate records.",
    "Identify invalid ranges.",
    "Identify inconsistent categories.",
    "Measure data quality before modeling.",
  ],

  concepts: [
    {
      title: "Completeness",
      explanation:
        "Completeness asks whether required values are present.",
    },
    {
      title: "Validity",
      explanation:
        "Validity asks whether values satisfy expected rules and ranges.",
    },
    {
      title: "Consistency",
      explanation:
        "Consistency asks whether equivalent values use the same representation.",
    },
    {
      title: "Uniqueness",
      explanation:
        "Uniqueness helps identify records that may have been duplicated.",
    },
  ],

  observations: [
    {
      title: "Cleaning is contextual",
      description:
        "A value of zero can be perfectly valid for one feature and impossible for another.",
    },
    {
      title: "Do not clean blindly",
      description:
        "Every transformation should be based on the meaning of the feature and the downstream task.",
    },
  ],

  commonMistakes: [
    "Dropping every row containing a missing value.",
    "Treating every unusual value as an error.",
    "Cleaning the entire dataset before the train/test split when the operation learns from data.",
    "Ignoring inconsistent category spelling.",
  ],

  challenges: [
    {
      question:
        "Why might replacing all missing numeric values with zero be dangerous?",
      hint:
        "Ask whether zero has a real-world meaning.",
      answer:
        "Zero may represent a genuine measurement and can introduce a false signal when used as a universal missing-value replacement.",
    },
  ],

  keyInsight:
    "Data cleaning is not deleting inconvenient values; it is preserving the meaning and reliability of the dataset.",
};

const advancedDataQuality: NativeVisualizationContent = {
  id: "advanced-data-quality-dashboard",

  family: "data",

  title: "Advanced Data Quality Dashboard",

  subtitle:
    "Analyze completeness, validity, consistency, uniqueness and distribution quality together.",

  concept:
    "Advanced quality analysis evaluates multiple dimensions of dataset reliability instead of treating cleaning as a collection of isolated fixes.",

  whyItMatters:
    "Production ML systems need repeatable quality checks because incoming data can drift, schemas can change and invalid values can silently enter pipelines.",

  learningObjectives: [
    "Measure multiple quality dimensions.",
    "Prioritize quality issues.",
    "Understand schema validation.",
    "Recognize distribution anomalies.",
    "Think about automated quality checks.",
  ],

  concepts: [
    {
      title: "Schema quality",
      explanation:
        "Expected columns, types and constraints should be explicitly validated.",
    },
    {
      title: "Distribution quality",
      explanation:
        "A column may have valid individual values while its overall distribution changes unexpectedly.",
    },
    {
      title: "Quality monitoring",
      explanation:
        "Production systems should repeatedly check quality rather than assume future data resembles training data.",
    },
  ],

  observations: [
    {
      title: "Not all issues have equal severity",
      description:
        "A missing optional field and an invalid target label should not receive the same priority.",
    },
    {
      title: "Quality is measurable",
      description:
        "Missing rates, duplicate counts, range violations and schema failures can be tracked quantitatively.",
    },
  ],

  commonMistakes: [
    "Using only missing-value percentage as a quality metric.",
    "Ignoring schema changes.",
    "Failing to compare production distributions with expected distributions.",
  ],

  challenges: [
    {
      question:
        "A feature suddenly contains strings even though training data was numeric. What type of issue is this?",
      hint:
        "Think about expected structure and type.",
      answer:
        "It is primarily a schema/type validity issue.",
    },
  ],

  keyInsight:
    "Reliable ML starts with measurable and repeatable data-quality checks.",
};

const edaExplorer: NativeVisualizationContent = {
  id: "eda-interactive-dashboard",

  family: "data",

  title: "Interactive EDA Dashboard",

  subtitle:
    "Explore distributions, relationships, missingness and category frequencies before choosing a model.",

  concept:
    "Exploratory Data Analysis uses numerical summaries and visualizations to understand the structure, quality and relationships within a dataset.",

  whyItMatters:
    "EDA can reveal skewed distributions, leakage, class imbalance, unusual categories, outliers and relationships that should influence preprocessing and modeling decisions.",

  learningObjectives: [
    "Perform univariate analysis.",
    "Perform bivariate analysis.",
    "Inspect distributions.",
    "Inspect categorical frequencies.",
    "Use EDA to generate modeling questions.",
  ],

  concepts: [
    {
      title: "Univariate analysis",
      explanation:
        "Study one feature at a time using distributions and summary statistics.",
    },
    {
      title: "Bivariate analysis",
      explanation:
        "Study the relationship between two variables.",
    },
    {
      title: "Target-aware EDA",
      explanation:
        "Compare features with the target carefully while avoiding transformations that leak future information.",
    },
  ],

  observations: [
    {
      title: "Visuals and statistics complement each other",
      description:
        "A mean alone can hide skewness, multiple modes and extreme values.",
    },
    {
      title: "EDA should create questions",
      description:
        "Good EDA does more than create charts; it identifies hypotheses and potential problems.",
    },
  ],

  commonMistakes: [
    "Creating many charts without interpreting them.",
    "Using correlation as proof of causation.",
    "Ignoring the target distribution.",
    "Performing preprocessing based on test-set information.",
  ],

  challenges: [
    {
      question:
        "A target contains 95% class A and 5% class B. What important issue did EDA reveal?",
      hint:
        "Compare class frequencies.",
      answer:
        "Strong class imbalance, which affects metric choice and potentially the training strategy.",
    },
  ],

  keyInsight:
    "EDA is the process of learning what questions the dataset is forcing you to answer before modeling.",
};

const advancedEDA: NativeVisualizationContent = {
  id: "advanced-eda-multivariate-lab",

  family: "data",

  title: "Advanced Multivariate EDA Lab",

  subtitle:
    "Study interactions among multiple features instead of inspecting variables only in isolation.",

  concept:
    "Multivariate EDA investigates how several variables behave together and can reveal interactions hidden by univariate summaries.",

  whyItMatters:
    "ML models often learn relationships among several features simultaneously. Understanding those relationships helps with feature engineering and model diagnostics.",

  learningObjectives: [
    "Understand multivariate relationships.",
    "Interpret grouped distributions.",
    "Use correlation carefully.",
    "Look for interactions.",
    "Recognize confounding patterns.",
  ],

  concepts: [
    {
      title: "Interaction",
      explanation:
        "The effect of one feature can depend on the value of another feature.",
    },
    {
      title: "Correlation structure",
      explanation:
        "A correlation matrix summarizes pairwise linear relationships but does not explain causality.",
    },
    {
      title: "Grouped distributions",
      explanation:
        "Comparing distributions across categories can reveal subgroup behavior.",
    },
  ],

  observations: [
    {
      title: "Pairwise views can miss interactions",
      description:
        "A relationship may appear only after conditioning on another feature.",
    },
    {
      title: "Correlation is limited",
      description:
        "A low Pearson correlation does not imply that no nonlinear relationship exists.",
    },
  ],

  commonMistakes: [
    "Treating correlation as causation.",
    "Removing correlated variables automatically without considering the model and objective.",
    "Ignoring nonlinear relationships.",
  ],

  challenges: [
    {
      question:
        "Can two variables have a strong nonlinear relationship but low Pearson correlation?",
      hint:
        "Pearson correlation focuses on linear association.",
      answer:
        "Yes. A strong curved or symmetric nonlinear relationship can have weak linear correlation.",
    },
  ],

  keyInsight:
    "Multivariate EDA looks for structure that cannot be understood by examining each column independently.",
};

const chartSelection: NativeVisualizationContent = {
  id: "chart-selection-playground",

  family: "data",

  title: "Chart Selection Playground",

  subtitle:
    "Choose visualizations based on the question and variable types rather than habit.",

  concept:
    "Different charts emphasize different properties of data. Effective visualization begins with the analytical question and variable types.",

  whyItMatters:
    "The wrong chart can hide patterns or create misleading impressions, while the right chart can make an important relationship immediately visible.",

  learningObjectives: [
    "Choose charts for distributions.",
    "Choose charts for relationships.",
    "Choose charts for categorical comparisons.",
    "Recognize misleading visual encodings.",
  ],

  concepts: [
    {
      title: "Histogram",
      explanation:
        "Useful for understanding the distribution of a numeric variable.",
    },
    {
      title: "Scatter plot",
      explanation:
        "Useful for examining relationships between two numeric variables.",
    },
    {
      title: "Bar chart",
      explanation:
        "Useful for comparing quantities across categories.",
    },
    {
      title: "Box plot",
      explanation:
        "Useful for comparing numeric distributions and identifying potential extreme observations.",
    },
  ],

  observations: [
    {
      title: "Question first",
      description:
        "Do not choose a chart because it looks attractive; choose it because it answers a specific question.",
    },
    {
      title: "Scale matters",
      description:
        "Axis choices and transformations can strongly affect visual interpretation.",
    },
  ],

  commonMistakes: [
    "Using a line chart for unrelated categories.",
    "Using too many categories in one visual.",
    "Using distorted axes that exaggerate differences.",
  ],

  challenges: [
    {
      question:
        "Which chart is a natural first choice for exploring the relationship between height and weight?",
      hint:
        "Both variables are numeric.",
      answer:
        "A scatter plot.",
    },
  ],

  keyInsight:
    "A visualization is useful when its visual encoding matches the analytical question.",
};

/* =========================================================
   STATISTICS
   ========================================================= */

const statisticsExplorer: NativeVisualizationContent = {
  id: "statistics-distribution-sampling-lab",

  family: "statistics",

  title: "Statistics, Distribution & Sampling Lab",

  subtitle:
    "Manipulate a distribution and observe how center, spread, samples and summary statistics respond.",

  concept:
    "Statistics describes data and quantifies uncertainty. Measures of center, spread and sampling behavior help us reason about datasets beyond individual observations.",

  whyItMatters:
    "ML evaluation, preprocessing and experimentation rely heavily on statistical thinking. Without it, metrics and distributions are easy to misinterpret.",

  learningObjectives: [
    "Understand mean and median.",
    "Understand variance and standard deviation.",
    "Understand distributions.",
    "Understand samples versus populations.",
    "Recognize the effect of outliers on summary statistics.",
  ],

  concepts: [
    {
      title: "Mean",
      explanation:
        "The arithmetic mean is the sum of observations divided by their count.",
    },
    {
      title: "Median",
      explanation:
        "The median is the middle value after ordering the observations and is often more resistant to extreme values.",
    },
    {
      title: "Variance",
      explanation:
        "Variance summarizes squared deviations from the mean.",
    },
    {
      title: "Standard deviation",
      explanation:
        "Standard deviation is the square root of variance and expresses spread in the original unit of the variable.",
    },
    {
      title: "Sample",
      explanation:
        "A sample is a subset of observations used to learn about a larger population.",
    },
  ],

  formulas: [
    {
      name: "Arithmetic mean",
      formula: "x̄ = Σxᵢ / n",
      explanation:
        "Add all observed values and divide by the number of observations.",
    },
    {
      name: "Population variance",
      formula: "σ² = Σ(xᵢ - μ)² / N",
      explanation:
        "Variance measures average squared distance from the population mean.",
    },
    {
      name: "Standard deviation",
      formula: "σ = √σ²",
      explanation:
        "Standard deviation converts variance back to the original measurement scale.",
    },
  ],

  observations: [
    {
      title: "Outliers pull the mean",
      description:
        "An extreme observation can move the mean substantially while having a smaller effect on the median.",
    },
    {
      title: "Spread is independent of center",
      description:
        "Two datasets can have the same mean but very different variability.",
    },
    {
      title: "Samples vary",
      description:
        "Different random samples from the same population generally produce slightly different statistics.",
    },
  ],

  commonMistakes: [
    "Assuming the mean always represents a typical observation.",
    "Ignoring distribution shape.",
    "Confusing population parameters with sample statistics.",
    "Interpreting correlation as causation.",
  ],

  challenges: [
    {
      question:
        "For salaries [30, 32, 35, 38, 500], which is likely to better represent a typical salary: mean or median?",
      hint:
        "Notice the extreme value.",
      answer:
        "The median is generally more representative here because the value 500 strongly pulls the mean upward.",
    },
    {
      question:
        "Can two datasets have equal means but different standard deviations?",
      hint:
        "Center and spread describe different properties.",
      answer:
        "Yes. They can share the same center while observations are distributed very differently around it.",
    },
  ],

  keyInsight:
    "Never summarize a dataset using only its center; understand its spread and distribution as well.",
};

/* =========================================================
   PREPROCESSING
   ========================================================= */

const missingValues: NativeVisualizationContent = {
  id: "missing-value-imputation-lab",

  family: "preprocessing",

  title: "Missing Value & Imputation Lab",

  subtitle:
    "Compare deletion, mean, median, mode and model-ready imputation strategies.",

  concept:
    "Missing data requires deliberate treatment because the absence of a value can change distributions, reduce usable data and sometimes contain information itself.",

  whyItMatters:
    "Most ML estimators expect usable numerical or categorical values. An inappropriate imputation strategy can distort relationships and introduce leakage.",

  learningObjectives: [
    "Measure missingness.",
    "Understand basic imputation strategies.",
    "Compare mean and median imputation.",
    "Handle categorical missing values.",
    "Prevent train/test leakage during imputation.",
  ],

  concepts: [
    {
      title: "Deletion",
      explanation:
        "Rows or columns can sometimes be removed, but deletion can discard useful information and alter the sample.",
    },
    {
      title: "Mean imputation",
      explanation:
        "Missing numeric values are replaced by the mean learned from the training data.",
    },
    {
      title: "Median imputation",
      explanation:
        "Median imputation is often more robust when a numeric distribution contains extreme values.",
    },
    {
      title: "Categorical imputation",
      explanation:
        "Categorical values can use the most frequent category or an explicit missing category depending on the problem.",
    },
  ],

  observations: [
    {
      title: "Imputation changes distributions",
      description:
        "Replacing many observations with one central value can reduce apparent variance.",
    },
    {
      title: "Fit on training data",
      description:
        "Statistics used for imputation should be learned from training data and then applied to validation/test data.",
    },
  ],

  commonMistakes: [
    "Computing imputation statistics using the complete dataset before splitting.",
    "Replacing every missing numeric value with zero.",
    "Dropping large numbers of rows without checking the consequence.",
  ],

  challenges: [
    {
      question:
        "Why should the test-set mean not be used to impute the test set?",
      hint:
        "Think about information available during model training.",
      answer:
        "It lets test-set information influence preprocessing. The imputer should learn its statistics from training data only.",
    },
  ],

  keyInsight:
    "Imputation is a learned preprocessing step and therefore belongs inside the training pipeline.",
};

const outlierLab: NativeVisualizationContent = {
  id: "outlier-detection-lab",

  family: "preprocessing",

  title: "Outlier Detection Lab",

  subtitle:
    "Explore IQR, z-score intuition and the effect of extreme observations on a dataset.",

  concept:
    "An outlier is an observation that is unusual relative to other observations, but unusual does not automatically mean incorrect.",

  whyItMatters:
    "Extreme values can strongly affect means, variances, distance-based models and regression estimates. Removing valid rare cases, however, can destroy important information.",

  learningObjectives: [
    "Recognize extreme observations.",
    "Understand IQR-based detection.",
    "Understand z-score intuition.",
    "Differentiate unusual from invalid.",
    "Compare treatment strategies.",
  ],

  formulas: [
    {
      name: "Interquartile range",
      formula: "IQR = Q3 - Q1",
      explanation:
        "IQR measures the spread of the middle 50% of observations.",
    },
    {
      name: "Common IQR fences",
      formula:
        "[Q1 - 1.5×IQR, Q3 + 1.5×IQR]",
      explanation:
        "Values outside these fences are often flagged for investigation, not automatically deleted.",
    },
    {
      name: "Z-score",
      formula: "z = (x - μ) / σ",
      explanation:
        "A z-score measures distance from the mean in standard-deviation units.",
    },
  ],

  concepts: [
    {
      title: "Detection",
      explanation:
        "Statistical rules can flag observations that deserve inspection.",
    },
    {
      title: "Investigation",
      explanation:
        "Domain knowledge determines whether an extreme observation is an error, rare valid case or meaningful event.",
    },
    {
      title: "Treatment",
      explanation:
        "Possible treatments include correction, transformation, capping, robust methods or leaving the value unchanged.",
    },
  ],

  observations: [
    {
      title: "Outlier does not mean error",
      description:
        "A rare but legitimate transaction or medical measurement may be extremely important.",
    },
    {
      title: "Model sensitivity differs",
      description:
        "Some algorithms and statistics are much more sensitive to extreme values than others.",
    },
  ],

  commonMistakes: [
    "Deleting every value outside an IQR fence.",
    "Detecting outliers using the target in a way that leaks information.",
    "Ignoring domain constraints.",
  ],

  challenges: [
    {
      question:
        "A transaction is 20 times larger than usual but verified as genuine. Should it automatically be deleted?",
      hint:
        "Unusual and invalid are not synonyms.",
      answer:
        "No. It should be investigated and handled according to the modeling objective; it may represent important real behavior.",
    },
  ],

  keyInsight:
    "Outlier detection is a flag for investigation, not an automatic deletion rule.",
};

const featureScaling: NativeVisualizationContent = {
  id: "feature-scaling-distance-lab",

  family: "preprocessing",

  title: "Feature Scaling & Distance Lab",

  subtitle:
    "Compare original data, StandardScaler, MinMaxScaler and RobustScaler while watching distances change.",

  concept:
    "Feature scaling transforms numeric features so differences in measurement units do not dominate algorithms that depend on distances, gradients or regularization.",

  whyItMatters:
    "A salary measured in tens of thousands can numerically dominate an age measured in tens, even when salary is not inherently more important. KNN, SVM and many optimization-based models can therefore behave very differently after scaling.",

  learningObjectives: [
    "Understand why feature magnitude matters.",
    "Understand standardization.",
    "Understand min-max normalization.",
    "Understand RobustScaler intuition.",
    "Connect scaling with distance-based algorithms.",
    "Understand when scaling is less important.",
  ],

  formulas: [
    {
      name: "Standardization",
      formula: "z = (x - μ) / σ",
      explanation:
        "Subtract the training mean and divide by the training standard deviation.",
    },
    {
      name: "Min-Max scaling",
      formula:
        "x' = (x - xmin) / (xmax - xmin)",
      explanation:
        "Maps values to a fixed range, commonly 0 to 1.",
    },
  ],

  concepts: [
    {
      title: "StandardScaler",
      explanation:
        "Centers a feature around zero and scales using standard deviation.",
    },
    {
      title: "MinMaxScaler",
      explanation:
        "Rescales observations relative to the feature minimum and maximum.",
    },
    {
      title: "RobustScaler",
      explanation:
        "Uses robust statistics such as the median and IQR, reducing sensitivity to extreme observations.",
    },
    {
      title: "Distance",
      explanation:
        "Without scaling, a feature with a much larger numerical range can dominate Euclidean distance.",
    },
  ],

  observations: [
    {
      title: "Scaling changes magnitude",
      description:
        "Scaling changes the numerical representation but should preserve the intended information represented by the feature.",
    },
    {
      title: "Outliers affect scalers differently",
      description:
        "Min-max scaling can be strongly affected by extreme minima or maxima, while robust scaling is designed to reduce that sensitivity.",
    },
    {
      title: "Trees behave differently",
      description:
        "Decision-tree splits are generally not driven by Euclidean feature magnitude, so scaling is usually less critical for tree-based models.",
    },
  ],

  commonMistakes: [
    "Fitting the scaler before the train/test split.",
    "Scaling the target accidentally.",
    "Assuming every algorithm requires scaling.",
    "Using test-set statistics when transforming test data.",
  ],

  challenges: [
    {
      question:
        "Why can salary dominate age in KNN if salary ranges from 20,000 to 200,000 while age ranges from 18 to 60?",
      hint:
        "KNN uses distances between observations.",
      answer:
        "The numerical differences in salary can be thousands of times larger, so salary contributes far more to the distance unless the features are appropriately scaled.",
    },
    {
      question:
        "Which scaler would you investigate when extreme outliers make mean and standard deviation unstable?",
      hint:
        "Look for a scaler based on robust statistics.",
      answer:
        "RobustScaler is a strong candidate because it uses statistics such as the median and IQR.",
    },
  ],

  keyInsight:
    "Scaling prevents measurement units from silently becoming feature importance in algorithms that depend on numerical distance or optimization geometry.",
};

const categoricalEncoding: NativeVisualizationContent = {
  id: "categorical-encoding-lab",

  family: "preprocessing",

  title: "Categorical Encoding Lab",

  subtitle:
    "Compare ordinal encoding and one-hot encoding while examining what numerical meaning each representation introduces.",

  concept:
    "Most ML algorithms operate on numerical representations, so categorical values must often be encoded without introducing incorrect relationships.",

  whyItMatters:
    "Encoding 'red', 'green' and 'blue' as 1, 2 and 3 may accidentally imply order and numerical distance. The encoding strategy therefore changes what information the model can infer.",

  learningObjectives: [
    "Differentiate nominal and ordinal categories.",
    "Understand one-hot encoding.",
    "Understand ordinal encoding.",
    "Recognize artificial ordering.",
    "Handle unknown categories conceptually.",
  ],

  concepts: [
    {
      title: "Nominal category",
      explanation:
        "Nominal categories have labels but no inherent order, such as city or color.",
    },
    {
      title: "Ordinal category",
      explanation:
        "Ordinal categories have a meaningful order, such as low, medium and high.",
    },
    {
      title: "One-hot encoding",
      explanation:
        "Creates indicator columns representing category membership without assigning an arbitrary numerical order.",
    },
  ],

  observations: [
    {
      title: "Numbers can imply structure",
      description:
        "Encoding categories with arbitrary integers can create an unintended order or distance.",
    },
    {
      title: "Encoding belongs in the pipeline",
      description:
        "The encoder should learn categories from training data and consistently transform later data.",
    },
  ],

  commonMistakes: [
    "Using arbitrary label numbers for nominal input features.",
    "Fitting the encoder using test data.",
    "Failing to plan for previously unseen categories.",
  ],

  challenges: [
    {
      question:
        "Should red, green and blue usually be encoded as 1, 2 and 3 for a distance-based model?",
      hint:
        "Does blue really mean three times red?",
      answer:
        "Usually no. Those numbers introduce arbitrary order and distance. One-hot encoding is often more appropriate for nominal categories.",
    },
  ],

  keyInsight:
    "Encoding is not merely converting text to numbers; it is deciding what relationships the numerical representation communicates to the model.",
};

const featureEngineering: NativeVisualizationContent = {
  id: "feature-engineering-playground",

  family: "preprocessing",

  title: "Feature Engineering Playground",

  subtitle:
    "Transform raw columns into features that express useful structure more directly.",

  concept:
    "Feature engineering creates or transforms variables so useful information is easier for a model to represent.",

  whyItMatters:
    "A meaningful feature can improve a simple model more than adding unnecessary algorithmic complexity.",

  learningObjectives: [
    "Create derived numeric features.",
    "Understand transformations.",
    "Create date/time features.",
    "Understand interaction features.",
    "Avoid leakage during feature creation.",
  ],

  concepts: [
    {
      title: "Derived feature",
      explanation:
        "A new variable can be computed from existing information, such as BMI from weight and height.",
    },
    {
      title: "Interaction",
      explanation:
        "An interaction feature represents a combined relationship between variables.",
    },
    {
      title: "Transformation",
      explanation:
        "Logarithmic or other transformations can sometimes make skewed relationships easier to model.",
    },
  ],

  observations: [
    {
      title: "Domain knowledge matters",
      description:
        "Useful engineered features often come from understanding what the variables mean.",
    },
    {
      title: "Availability matters",
      description:
        "A feature is invalid if its information would not actually be available at prediction time.",
    },
  ],

  commonMistakes: [
    "Creating features using future information.",
    "Creating hundreds of meaningless interactions.",
    "Engineering features before considering the model and domain.",
  ],

  challenges: [
    {
      question:
        "Why can 'days since last purchase' be more useful than a raw purchase date?",
      hint:
        "Think about what behavior the model may care about.",
      answer:
        "It directly expresses recency, which may be more closely related to the prediction objective than the raw calendar date.",
    },
  ],

  keyInsight:
    "Good feature engineering converts raw data into representations that expose useful structure without leaking unavailable information.",
};

const featureSelection: NativeVisualizationContent = {
  id: "feature-selection-lab",

  family: "preprocessing",

  title: "Feature Selection Lab",

  subtitle:
    "Explore why more features do not automatically produce a better model.",

  concept:
    "Feature selection chooses a subset of available features to reduce noise, complexity, cost or redundancy while retaining useful predictive information.",

  whyItMatters:
    "Irrelevant or redundant features can increase complexity, make interpretation harder and sometimes hurt generalization.",

  learningObjectives: [
    "Understand filter methods.",
    "Understand wrapper methods conceptually.",
    "Understand embedded selection conceptually.",
    "Recognize redundant features.",
    "Avoid target leakage during selection.",
  ],

  concepts: [
    {
      title: "Filter methods",
      explanation:
        "Features are evaluated using statistical criteria independently of a specific final model.",
    },
    {
      title: "Wrapper methods",
      explanation:
        "Feature subsets are evaluated through model performance.",
    },
    {
      title: "Embedded methods",
      explanation:
        "Selection occurs as part of the model-fitting process.",
    },
  ],

  observations: [
    {
      title: "More is not always better",
      description:
        "Additional features can add noise or unnecessary complexity.",
    },
    {
      title: "Selection must respect validation",
      description:
        "Selecting features using the entire dataset can leak validation/test information.",
    },
  ],

  commonMistakes: [
    "Selecting features using test-set performance.",
    "Removing features solely because pairwise correlation is low.",
    "Assuming importance implies causality.",
  ],

  challenges: [
    {
      question:
        "Why should feature selection happen inside cross-validation when it learns from data?",
      hint:
        "Think about what information the validation fold should reveal.",
      answer:
        "Otherwise information from validation observations can influence which features are selected, producing optimistic evaluation.",
    },
  ],

  keyInsight:
    "Feature selection is part of model training and must follow the same leakage-prevention rules as other learned preprocessing.",
};

const advancedPreprocessing: NativeVisualizationContent = {
  id: "advanced-preprocessing-flow-lab",

  family: "preprocessing",

  title: "Advanced Preprocessing Flow Lab",

  subtitle:
    "Build different preprocessing paths for numeric and categorical features.",

  concept:
    "Real tabular datasets contain heterogeneous feature types. Numeric and categorical columns often require different transformations before being recombined.",

  whyItMatters:
    "A single global transformation rarely makes sense for mixed data. Production pipelines need explicit preprocessing branches.",

  learningObjectives: [
    "Separate numeric and categorical columns.",
    "Apply type-specific imputers.",
    "Apply scaling only where appropriate.",
    "Apply categorical encoding.",
    "Recombine transformed features safely.",
  ],

  concepts: [
    {
      title: "Numeric branch",
      explanation:
        "Numeric columns may use numeric imputation and scaling.",
    },
    {
      title: "Categorical branch",
      explanation:
        "Categorical columns may use categorical imputation followed by encoding.",
    },
    {
      title: "Recombination",
      explanation:
        "After independent transformations, feature branches are combined into one model-ready representation.",
    },
  ],

  observations: [
    {
      title: "Different columns need different treatment",
      description:
        "Median imputation makes sense for many numeric columns but not for arbitrary text categories.",
    },
    {
      title: "Preprocessing is learned",
      description:
        "Imputation values, scaling statistics and category mappings are fitted parameters.",
    },
  ],

  commonMistakes: [
    "Applying StandardScaler directly to raw categorical strings.",
    "Using one imputation strategy for every column.",
    "Learning preprocessing statistics from the entire dataset.",
  ],

  challenges: [
    {
      question:
        "Why should numeric and categorical features often use separate preprocessing branches?",
      hint:
        "Compare the operations appropriate for each data type.",
      answer:
        "Their missing-value strategies and transformations differ; numeric scaling and categorical encoding solve different representation problems.",
    },
  ],

  keyInsight:
    "Professional preprocessing is a structured transformation graph, not a sequence of random DataFrame edits.",
};

const pipelineBuilder: NativeVisualizationContent = {
  id: "pipeline-column-transformer-builder",

  family: "preprocessing",

  title: "Pipeline & ColumnTransformer Builder",

  subtitle:
    "Construct a leakage-safe scikit-learn workflow from raw mixed-type data to final estimator.",

  concept:
    "ColumnTransformer applies different preprocessing to selected columns, while Pipeline chains preprocessing and modeling into one estimator-like workflow.",

  whyItMatters:
    "This architecture prevents training/validation inconsistencies, reduces leakage risk and allows cross-validation and hyperparameter search to repeat preprocessing correctly.",

  learningObjectives: [
    "Understand SimpleImputer.",
    "Understand ColumnTransformer.",
    "Understand Pipeline.",
    "Build numeric and categorical branches.",
    "Understand why preprocessing belongs inside cross-validation.",
    "Understand nested parameter names conceptually.",
  ],

  concepts: [
    {
      title: "SimpleImputer",
      explanation:
        "Learns replacement statistics from training data and applies them consistently to later data.",
    },
    {
      title: "ColumnTransformer",
      explanation:
        "Routes selected columns through different transformation pipelines.",
    },
    {
      title: "Pipeline",
      explanation:
        "Chains transformations and a final estimator so the workflow can be fitted and evaluated as one object.",
    },
    {
      title: "Cross-validation safety",
      explanation:
        "When preprocessing is inside the pipeline, each training fold fits its own preprocessing parameters before transforming its validation fold.",
    },
  ],

  observations: [
    {
      title: "Pipeline reduces manual mistakes",
      description:
        "The same fitted transformations are automatically applied in the correct order.",
    },
    {
      title: "Search can reach nested parameters",
      description:
        "scikit-learn uses double-underscore parameter paths to tune nested pipeline components.",
    },
  ],

  commonMistakes: [
    "Scaling the entire dataset before cross-validation.",
    "Fitting separate preprocessing manually on validation data.",
    "Forgetting handle_unknown behavior for categorical encoders.",
    "Using different transformations during training and inference.",
  ],

  challenges: [
    {
      question:
        "Why is Pipeline + ColumnTransformer safer than manually preprocessing the full dataset before GridSearchCV?",
      hint:
        "Think about what happens independently inside each CV fold.",
      answer:
        "The pipeline refits preprocessing using only each fold's training portion, preventing validation-fold information from influencing learned transformations.",
    },
  ],

  keyInsight:
    "A Pipeline turns preprocessing from a collection of manual steps into part of the model-training procedure itself.",
};

/* =========================================================
   REGISTRY
   ========================================================= */

export const nativeVisualizationContentRegistry:
  Record<string, NativeVisualizationContent> = {
    [pythonExecutionFlow.id]:
      pythonExecutionFlow,

    [pythonDataStructures.id]:
      pythonDataStructures,

    [pythonFunctionFlow.id]:
      pythonFunctionFlow,

    [pythonDataPipeline.id]:
      pythonDataPipeline,

    [pythonExceptionFlow.id]:
      pythonExceptionFlow,

    [pythonOOP.id]:
      pythonOOP,

    [pythonGeneratorMemory.id]:
      pythonGeneratorMemory,

    [numpyBroadcasting.id]:
      numpyBroadcasting,

    [pandasOperations.id]:
      pandasOperations,

    [dataCleaning.id]:
      dataCleaning,

    [advancedDataQuality.id]:
      advancedDataQuality,

    [edaExplorer.id]:
      edaExplorer,

    [advancedEDA.id]:
      advancedEDA,

    [chartSelection.id]:
      chartSelection,

    [statisticsExplorer.id]:
      statisticsExplorer,

    [missingValues.id]:
      missingValues,

    [outlierLab.id]:
      outlierLab,

    [featureScaling.id]:
      featureScaling,

    [categoricalEncoding.id]:
      categoricalEncoding,

    [featureEngineering.id]:
      featureEngineering,

    [featureSelection.id]:
      featureSelection,

    [advancedPreprocessing.id]:
      advancedPreprocessing,

    [pipelineBuilder.id]:
      pipelineBuilder,
  };

export function getNativeVisualizationContent(
  visualizationId?: string
): NativeVisualizationContent | undefined {
  if (!visualizationId) {
    return undefined;
  }

  return nativeVisualizationContentRegistry[
    visualizationId
  ];
}

export function hasNativeVisualizationContent(
  visualizationId?: string
): boolean {
  if (!visualizationId) {
    return false;
  }

  return Boolean(
    nativeVisualizationContentRegistry[
      visualizationId
    ]
  );
}

export function getAllNativeVisualizationContent():
  NativeVisualizationContent[] {
  return Object.values(
    nativeVisualizationContentRegistry
  );
}