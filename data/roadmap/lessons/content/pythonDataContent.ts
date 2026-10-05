import type { DeepLessonRegistry } from "./lessonContentTypes";

export const pythonDataContent: DeepLessonRegistry = {
  // =========================================================
  // PYTHON BASICS
  // =========================================================

  "python-basics": {
    overview:
      "Python is the primary programming language used throughout this ModelMind roadmap. Before using NumPy, Pandas or machine-learning libraries, you need to understand how Python stores values, evaluates expressions, controls program flow and interacts with data. This lesson builds those foundations through examples that connect directly to later data-science work.",

    objectives: [
      "Understand how Python executes statements.",
      "Create and use variables correctly.",
      "Differentiate important Python data types.",
      "Use arithmetic, comparison and logical operators.",
      "Accept and convert user input.",
      "Write conditional logic with if, elif and else.",
      "Use for and while loops.",
      "Recognize common beginner Python errors.",
      "Connect Python fundamentals with later ML code.",
    ],

    sections: [
      {
        id: "python-basics-execution",
        title: "How Python Programs Work",

        explanation: [
          "A Python program is a sequence of instructions executed by the Python interpreter.",
          "Python generally executes statements from top to bottom unless control-flow structures such as conditions, loops or function calls change the order.",
          "Python is dynamically typed. You normally do not declare the type of a variable explicitly before assigning a value.",
          "Indentation is part of Python syntax. It defines blocks of code belonging to conditions, loops, functions and classes.",
          "Python is case-sensitive, so age, Age and AGE are different identifiers.",
        ],

        intuition: [
          "Think of a Python program as a sequence of instructions. Most instructions execute in order, while conditions and loops decide which instructions should run and how many times.",
        ],

        importantPoints: [
          "Python uses indentation to define code blocks.",
          "Python is case-sensitive.",
          "Statements normally execute sequentially.",
          "Variables can reference values of different types.",
          "Readable naming and indentation become increasingly important as programs grow.",
        ],
      },

      {
        id: "python-basics-variables",
        title: "Variables and Assignment",

        explanation: [
          "A variable is a name that refers to a value or object.",
          "Assignment uses the equals sign. For example, age = 20 makes the name age refer to the integer value 20.",
          "The equals sign in assignment does not mean mathematical equality. It means assign the value on the right to the name on the left.",
          "Variables allow programs to store intermediate results and reuse them later.",
          "Meaningful variable names make data-analysis and ML code significantly easier to understand.",
        ],

        intuition: [
          "A variable is like a meaningful label attached to a value that your program needs to use later.",
        ],

        importantPoints: [
          "Use descriptive variable names.",
          "Assignment and equality comparison are different operations.",
          "Variables can be reassigned.",
          "Python variable names cannot begin with a digit.",
          "Avoid replacing useful built-in names such as list, str or sum.",
        ],
      },

      {
        id: "python-basics-types",
        title: "Core Data Types",

        explanation: [
          "Integers represent whole numbers such as 5, -10 and 2026.",
          "Floating-point values represent decimal numbers such as 3.14 or 0.95.",
          "Strings represent text and are written using quotation marks.",
          "Boolean values are True and False and are fundamental to conditions and filtering.",
          "None represents the absence of a normal value.",
          "The type() function can be used while learning or debugging to inspect the type of an object.",
        ],

        intuition: [
          "The type tells Python what kind of information a value represents and therefore which operations make sense for that value.",
        ],

        importantPoints: [
          "int stores whole numbers.",
          "float stores decimal values.",
          "str stores text.",
          "bool stores True or False.",
          "None represents the absence of a normal value.",
        ],
      },

      {
        id: "python-basics-conversion",
        title: "Input and Type Conversion",

        explanation: [
          "The input() function reads text from the user.",
          "Even when the user types digits, input() returns a string.",
          "If numerical calculations are required, convert the value using int() or float().",
          "Type conversion is common in data work because raw information may initially arrive as text.",
          "Invalid conversions can raise exceptions, which will be covered more deeply in the error-handling lesson.",
        ],

        intuition: [
          "Input gives Python characters. Conversion tells Python how those characters should be interpreted.",
        ],

        importantPoints: [
          "input() returns a string.",
          "Use int() for appropriate whole-number text.",
          "Use float() for appropriate decimal-number text.",
          "Not every string can be converted to a number.",
        ],
      },

      {
        id: "python-basics-operators",
        title: "Operators and Expressions",

        explanation: [
          "Arithmetic operators include +, -, *, /, //, % and **.",
          "Comparison operators include ==, !=, <, <=, > and >=.",
          "Logical operators include and, or and not.",
          "Comparison expressions produce Boolean results.",
          "These operators later become important in Pandas filtering, feature engineering and ML preprocessing logic.",
        ],

        intuition: [
          "Expressions combine values and operators to calculate a result or answer a question.",
        ],

        importantPoints: [
          "/ performs normal division.",
          "// performs floor division.",
          "% returns a remainder.",
          "** performs exponentiation.",
          "== compares values while = performs assignment.",
          "Logical operators combine Boolean conditions.",
        ],
      },

      {
        id: "python-basics-conditionals",
        title: "Conditional Statements",

        explanation: [
          "Conditional statements allow a program to make decisions.",
          "The if block runs when its condition evaluates to True.",
          "elif provides additional conditions.",
          "else handles the remaining case when earlier conditions are False.",
          "Conditions can combine comparisons using and, or and not.",
          "In data science, similar logic is used to create categories, validate data and implement business rules.",
        ],

        intuition: [
          "A conditional is a decision point: if this situation is true, follow one path; otherwise follow another.",
        ],

        importantPoints: [
          "Conditions evaluate to truth values.",
          "Indentation determines which statements belong to a branch.",
          "elif avoids unnecessarily nested conditions.",
          "Condition order can change program behavior.",
        ],
      },

      {
        id: "python-basics-loops",
        title: "Loops",

        explanation: [
          "Loops repeat operations.",
          "A for loop is commonly used to iterate through a sequence or a range of values.",
          "A while loop continues as long as its condition remains True.",
          "break terminates the nearest loop.",
          "continue skips the remainder of the current iteration.",
          "Although NumPy and Pandas often provide faster vectorized operations, understanding loops remains essential for Python reasoning.",
        ],

        intuition: [
          "A loop means perform this operation repeatedly while changing which item or state is being processed.",
        ],

        importantPoints: [
          "Use for when iterating over a collection or known range.",
          "Use while when repetition depends on a condition.",
          "Make sure while loops can eventually terminate.",
          "Prefer clear iteration over unnecessarily complicated loop logic.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-execution-flow-explorer",
      title: "Python Execution Flow Explorer",
      description:
        "Step through variables, expressions, conditions and loops while observing how Python changes program state after each statement.",
    },

    codeExamples: [
      {
        id: "python-basics-example-1",
        title: "Variables, Conditions and Loops",
        description:
          "Combine the most important Python fundamentals in a small student-score program.",
        language: "python",

        code: `name = "Aarav"
scores = [78, 91, 84, 69, 88]

total = 0

for score in scores:
    total += score

average = total / len(scores)

print("Student:", name)
print("Average:", average)

if average >= 90:
    grade = "A+"
elif average >= 80:
    grade = "A"
elif average >= 70:
    grade = "B"
else:
    grade = "C"

print("Grade:", grade)

passed_subjects = 0

for score in scores:
    if score >= 40:
        passed_subjects += 1

print(
    "Passed subjects:",
    passed_subjects
)`,

        explanation: [
          "name stores a string while scores stores multiple integer values.",
          "The first for loop accumulates the total score.",
          "len(scores) returns the number of score values.",
          "The if/elif/else structure converts the numerical average into a category.",
          "The second loop demonstrates conditional counting.",
          "This style of logic later appears in data validation and feature engineering.",
        ],

        commonMistakes: [
          "Forgetting indentation after for or if.",
          "Using = instead of == inside a comparison.",
          "Dividing by an incorrect count.",
          "Using unclear variable names.",
        ],
      },

      {
        id: "python-basics-example-2",
        title: "User Input and Conversion",
        description:
          "Read values from a user and perform a numerical calculation safely at the basic level.",
        language: "python",

        code: `name = input("Enter your name: ")

age_text = input(
    "Enter your age: "
)

age = int(age_text)

next_year_age = age + 1

print(
    "Hello",
    name
)

print(
    "Next year you will be",
    next_year_age
)`,

        explanation: [
          "input() returns text.",
          "int(age_text) converts appropriate numeric text to an integer.",
          "Only after conversion can age participate in numerical addition.",
          "Later error-handling lessons will show how to handle invalid input such as abc.",
        ],

        commonMistakes: [
          "Assuming input() automatically returns an integer.",
          "Trying to add 1 directly to an unconverted input string.",
        ],
      },
    ],

    practice: [
      {
        id: "python-basics-practice-1",
        title: "Predict the Output",
        type: "analysis",
        difficulty: "basic",

        question:
          "What is printed by: x = 7; y = 3; print(x // y, x % y, x ** y)?",

        instructions: [
          "Evaluate each operator separately.",
          "Explain what //, % and ** mean.",
        ],

        hints: [
          "7 divided by 3 has quotient 2 and remainder 1.",
        ],

        explanation:
          "The output is 2 1 343. Floor division gives 2, modulo gives 1 and exponentiation calculates 7³ = 343.",
      },

      {
        id: "python-basics-practice-2",
        title: "Fix the Type Error",
        type: "debugging",
        difficulty: "basic",

        question:
          'Why does age = input("Age: "); print(age + 1) fail, and how should it be corrected?',

        instructions: [
          "Identify the type returned by input().",
          "Convert the value before arithmetic.",
        ],

        hints: [
          "A string cannot be added directly to an integer.",
        ],

        explanation:
          'Use age = int(input("Age: ")) before print(age + 1), assuming the entered text represents a valid integer.',
      },

      {
        id: "python-basics-practice-3",
        title: "Write a Grade Classifier",
        type: "coding",
        difficulty: "basic",

        question:
          "Write conditional logic that prints Distinction for marks >= 75, First for marks >= 60, Pass for marks >= 40 and Fail otherwise.",

        instructions: [
          "Use if, elif and else.",
          "Check higher thresholds before lower thresholds.",
        ],

        hints: [
          "Condition order matters.",
        ],

        explanation:
          "Check >= 75 first, followed by >= 60, then >= 40, and use else for the remaining values.",
      },

      {
        id: "python-basics-practice-4",
        title: "Loop Through Scores",
        type: "coding",
        difficulty: "basic",

        question:
          "Given scores = [45, 82, 37, 91, 68], count how many scores are at least 50.",

        instructions: [
          "Create a counter.",
          "Iterate through scores.",
          "Increment only when the condition is true.",
        ],

        hints: [
          "Initialize count = 0.",
        ],

        explanation:
          "The qualifying scores are 82, 91 and 68, so the final count should be 3.",
      },

      {
        id: "python-basics-practice-5",
        title: "Design a Mini Program",
        type: "coding",
        difficulty: "medium",

        question:
          "Write a program that accepts three numerical marks, calculates their average and prints Pass only when the average is at least 40 and every individual mark is at least 30.",

        instructions: [
          "Convert input values to numbers.",
          "Calculate the average.",
          "Combine conditions using and.",
        ],

        hints: [
          "All requirements must be true for the student to pass.",
        ],

        explanation:
          "The final condition should combine average >= 40 with checks that each individual mark is >= 30.",
      },
    ],

    commonMistakes: [
      {
        id: "python-basics-mistake-1",
        title: "Confusing assignment and comparison",
        description:
          "Beginners may confuse = with ==.",
        correction:
          "Use = to assign a value and == to compare two values.",
      },

      {
        id: "python-basics-mistake-2",
        title: "Ignoring input types",
        description:
          "input() values may be treated as numbers without conversion.",
        correction:
          "Convert numerical input explicitly using int() or float() when appropriate.",
      },

      {
        id: "python-basics-mistake-3",
        title: "Incorrect indentation",
        description:
          "Statements may accidentally be placed outside their intended if or loop block.",
        correction:
          "Use consistent indentation and inspect the logical structure of the program.",
      },
    ],

    keyTakeaways: [
      "Python executes statements using a clear block structure based on indentation.",
      "Variables reference values used throughout a program.",
      "Types determine which operations are valid.",
      "input() returns strings.",
      "Operators build calculations and Boolean expressions.",
      "Conditions control decisions.",
      "Loops control repetition.",
      "These fundamentals are required for NumPy, Pandas and machine-learning code.",
    ],
  },


  // =========================================================
  // PYTHON DATA STRUCTURES
  // =========================================================

  "python-data-structures": {
    overview:
      "Python data structures determine how collections of information are represented and manipulated. Lists, tuples, dictionaries and sets appear constantly in data processing, configuration, feature definitions and ML workflows.",

    objectives: [
      "Create and manipulate Python lists.",
      "Understand indexing and slicing.",
      "Use tuples for ordered immutable collections.",
      "Store key-value relationships using dictionaries.",
      "Use sets for unique values and membership operations.",
      "Choose an appropriate data structure for a problem.",
      "Use comprehensions for concise transformations.",
    ],

    sections: [
      {
        id: "python-data-list",
        title: "Lists",

        explanation: [
          "A list is an ordered and mutable collection.",
          "Lists can contain multiple values and may even contain values of different types.",
          "Items are accessed using zero-based indexing.",
          "Negative indexing accesses elements from the end.",
          "Slicing extracts a range of elements.",
          "Because lists are mutable, items can be added, removed or changed after creation.",
        ],

        intuition: [
          "A list is similar to an ordered row of containers where each position has an index.",
        ],

        importantPoints: [
          "Lists preserve order.",
          "Lists are mutable.",
          "Indexing starts at zero.",
          "append() adds one item.",
          "Slicing uses start:stop:step.",
        ],
      },

      {
        id: "python-data-tuple",
        title: "Tuples",

        explanation: [
          "A tuple is an ordered collection similar to a list but is normally immutable.",
          "After creation, individual tuple elements cannot be reassigned.",
          "Tuples are useful for values that conceptually belong together and should not be modified casually.",
          "Functions may return multiple values using tuple-like packing and unpacking.",
        ],

        intuition: [
          "Think of a tuple as an ordered record whose structure should remain stable.",
        ],

        importantPoints: [
          "Tuples preserve order.",
          "Tuples are immutable.",
          "Tuple unpacking can assign several values at once.",
        ],
      },

      {
        id: "python-data-dictionary",
        title: "Dictionaries",

        explanation: [
          "A dictionary stores key-value pairs.",
          "Instead of locating information only by numerical position, values are retrieved using meaningful keys.",
          "Dictionaries are useful for configuration, records, mappings and structured results.",
          "Keys must be hashable and are unique within a dictionary.",
          "Dictionary values can contain almost any Python object.",
        ],

        intuition: [
          "A dictionary works like a lookup table: provide a key and retrieve the associated value.",
        ],

        importantPoints: [
          "Dictionaries store key-value mappings.",
          "Keys are unique.",
          "Use get() when a key may be absent and a fallback is useful.",
          "items() provides key-value pairs during iteration.",
        ],
      },

      {
        id: "python-data-set",
        title: "Sets",

        explanation: [
          "A set stores unique values.",
          "Duplicate values are removed automatically.",
          "Sets support union, intersection and difference operations.",
          "Membership testing is an important use case.",
          "Sets do not behave like indexed lists.",
        ],

        intuition: [
          "A set represents membership: an item either belongs to the set or it does not.",
        ],

        importantPoints: [
          "Sets contain unique elements.",
          "Sets are useful for duplicate removal.",
          "Intersection finds shared values.",
          "Union combines unique values.",
        ],
      },

      {
        id: "python-data-comprehension",
        title: "Comprehensions",

        explanation: [
          "Comprehensions provide concise syntax for constructing collections from existing iterables.",
          "A list comprehension can transform every item and optionally filter items.",
          "Dictionary and set comprehensions follow related ideas.",
          "Comprehensions are useful when they remain readable. Complex multi-step logic is often clearer as an ordinary loop.",
        ],

        intuition: [
          "A comprehension combines create a new collection, transform each item and optionally keep only selected items into one expression.",
        ],

        importantPoints: [
          "Prefer readability over extreme compactness.",
          "Comprehensions create new collections.",
          "Conditions can filter values.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-data-structure-explorer",
      title: "Python Data Structure Explorer",
      description:
        "Compare lists, tuples, dictionaries and sets visually while performing indexing, insertion, lookup, uniqueness and membership operations.",
    },

    codeExamples: [
      {
        id: "python-data-structures-code",
        title: "Working with Student Data",
        description:
          "Use lists, dictionaries, tuples and sets together.",
        language: "python",

        code: `students = [
    {
        "name": "Aarav",
        "score": 88,
        "branch": "AIML"
    },
    {
        "name": "Riya",
        "score": 93,
        "branch": "CSE"
    },
    {
        "name": "Kabir",
        "score": 76,
        "branch": "AIML"
    }
]

# Dictionary access
print(
    students[0]["name"]
)

# List comprehension
high_scorers = [
    student["name"]
    for student in students
    if student["score"] >= 85
]

print(high_scorers)

# Set comprehension
branches = {
    student["branch"]
    for student in students
}

print(branches)

# Tuple
model_result = (
    "Logistic Regression",
    0.91
)

model_name, accuracy = model_result

print(model_name)
print(accuracy)`,

        explanation: [
          "students is a list containing dictionaries.",
          "Each dictionary represents one student record.",
          "The list comprehension filters records according to score.",
          "The set comprehension extracts unique branch values.",
          "Tuple unpacking separates a model name and its score.",
          "Nested structures like these help prepare you for JSON-style data and ML experiment metadata.",
        ],

        commonMistakes: [
          "Using an invalid list index.",
          "Requesting a dictionary key that does not exist.",
          "Expecting sets to preserve list-style indexing.",
          "Trying to modify tuple elements.",
        ],
      },
    ],

    practice: [
      {
        id: "python-data-structures-practice-1",
        title: "List Indexing",
        type: "analysis",
        difficulty: "basic",
        question:
          "For values = [10, 20, 30, 40, 50], what are values[0], values[-1] and values[1:4]?",
        instructions: [
          "Remember zero-based indexing.",
          "Remember that the slicing stop index is excluded.",
        ],
        hints: [
          "-1 refers to the final item.",
        ],
        explanation:
          "values[0] is 10, values[-1] is 50 and values[1:4] produces [20, 30, 40].",
      },

      {
        id: "python-data-structures-practice-2",
        title: "Choose a Structure",
        type: "concept",
        difficulty: "basic",
        question:
          "Which core structure would you choose to map model names to accuracy scores, and why?",
        instructions: [
          "Think about key-value relationships.",
        ],
        hints: [
          "You want to retrieve a score using a model name.",
        ],
        explanation:
          "A dictionary is a natural choice because model names can act as keys and scores as values.",
      },

      {
        id: "python-data-structures-practice-3",
        title: "Remove Duplicates",
        type: "coding",
        difficulty: "basic",
        question:
          "Given labels = ['cat', 'dog', 'cat', 'bird', 'dog'], create a collection containing unique labels.",
        instructions: [
          "Use a set.",
        ],
        hints: [
          "set(labels) performs the conversion.",
        ],
        explanation:
          "set(labels) creates a set containing cat, dog and bird, although set display order should not be treated like list indexing.",
      },

      {
        id: "python-data-structures-practice-4",
        title: "Filter with a Comprehension",
        type: "coding",
        difficulty: "medium",
        question:
          "Given values = [2, 7, 10, 13, 18], create a list containing the squares of only even values.",
        instructions: [
          "Use a list comprehension.",
          "Filter using modulo.",
        ],
        hints: [
          "x % 2 == 0 identifies even values.",
        ],
        explanation:
          "A solution is [x ** 2 for x in values if x % 2 == 0], producing [4, 100, 324].",
      },

      {
        id: "python-data-structures-practice-5",
        title: "Nested Records",
        type: "coding",
        difficulty: "medium",
        question:
          "Create a list containing three dictionaries. Each dictionary should contain name and score. Print the name of the student with the highest score.",
        instructions: [
          "Represent each student as a dictionary.",
          "Store records in a list.",
          "Compare score values.",
        ],
        hints: [
          "max() can accept a key function, although a loop is also valid.",
        ],
        explanation:
          "One concise solution is max(students, key=lambda student: student['score']) and then reading the returned dictionary's name.",
      },
    ],

    keyTakeaways: [
      "Lists are ordered and mutable.",
      "Tuples are ordered and immutable.",
      "Dictionaries represent key-value mappings.",
      "Sets represent unique membership.",
      "Indexing and slicing are fundamental Python skills.",
      "Comprehensions provide concise transformations when kept readable.",
      "Nested collections are common in real data applications.",
    ],
  },


  // =========================================================
  // PYTHON FUNCTIONS
  // =========================================================

  "python-functions": {
    overview:
      "Functions organize reusable logic into named units. They are essential for clean data pipelines, preprocessing utilities, evaluation code and reusable ML experiments. A good function has a clear responsibility, predictable inputs and a meaningful output.",

    objectives: [
      "Define and call Python functions.",
      "Use parameters and return values.",
      "Understand positional and keyword arguments.",
      "Understand default parameters.",
      "Differentiate local and global scope.",
      "Return multiple values.",
      "Use lambda functions appropriately.",
      "Write reusable data-processing functions.",
    ],

    sections: [
      {
        id: "python-functions-purpose",
        title: "Why Functions Matter",

        explanation: [
          "Functions group related statements under a reusable name.",
          "They reduce repeated code and make large programs easier to understand.",
          "A function can receive information through parameters and send results back using return.",
          "In ML projects, functions are useful for data cleaning, feature creation, evaluation and repeated experiment logic.",
        ],

        intuition: [
          "A function is like a small machine: provide inputs, let it perform one responsibility, and receive an output.",
        ],

        importantPoints: [
          "Functions encourage reuse.",
          "Functions should have clear responsibilities.",
          "Parameters provide inputs.",
          "return provides outputs.",
        ],
      },

      {
        id: "python-functions-parameters",
        title: "Parameters and Arguments",

        explanation: [
          "Parameters are names defined in the function declaration.",
          "Arguments are the actual values supplied when the function is called.",
          "Positional arguments are matched according to position.",
          "Keyword arguments explicitly specify parameter names.",
          "Default parameter values make some arguments optional.",
        ],

        intuition: [
          "Parameters describe what a function expects; arguments are what a caller actually supplies.",
        ],

        importantPoints: [
          "Parameter order matters for positional arguments.",
          "Keyword arguments improve clarity.",
          "Defaults should represent sensible behavior.",
        ],
      },

      {
        id: "python-functions-return",
        title: "Return Values",

        explanation: [
          "return sends a result back to the caller.",
          "Printing a value and returning a value are different operations.",
          "A returned value can be stored, transformed, tested or passed to another function.",
          "Python functions can return multiple values, commonly represented through tuple packing.",
        ],

        intuition: [
          "print shows information to a person; return gives information back to the program.",
        ],

        importantPoints: [
          "Use return when another part of the program needs the result.",
          "Execution of the current function ends when return is executed.",
          "Functions without an explicit return produce None.",
        ],
      },

      {
        id: "python-functions-scope",
        title: "Variable Scope",

        explanation: [
          "Variables created inside a function normally have local scope.",
          "Local variables are separate from variables created outside the function.",
          "Relying heavily on global mutable state makes code difficult to reason about and test.",
          "Passing required information as parameters and returning results usually creates cleaner functions.",
        ],

        intuition: [
          "A function should ideally work with the information intentionally given to it rather than secretly depending on unrelated outside state.",
        ],

        importantPoints: [
          "Local variables belong to the function call.",
          "Avoid unnecessary global state.",
          "Explicit inputs make functions easier to test.",
        ],
      },

      {
        id: "python-functions-lambda",
        title: "Lambda Functions",

        explanation: [
          "A lambda is a small anonymous function expressed in one expression.",
          "Lambdas are commonly used for short key functions or transformations.",
          "They should not replace normal named functions when logic becomes complex.",
          "Pandas code sometimes uses lambdas with operations such as apply, although vectorized operations are often preferable.",
        ],

        intuition: [
          "A lambda is useful when a tiny function is needed temporarily and giving it a separate name would add little clarity.",
        ],

        importantPoints: [
          "Lambda functions contain one expression.",
          "Use them for simple operations.",
          "Prefer def for complex or reusable logic.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-function-call-explorer",
      title: "Function Call and Scope Explorer",
      description:
        "Trace arguments into parameters, observe local variables, follow return values and compare local versus global scope.",
    },

    codeExamples: [
      {
        id: "python-functions-code",
        title: "Reusable Data Summary Function",
        description:
          "Create a reusable function for summarizing numerical data.",
        language: "python",

        code: `def summarize(values):
    if len(values) == 0:
        return None

    minimum = min(values)
    maximum = max(values)
    average = sum(values) / len(values)

    return {
        "minimum": minimum,
        "maximum": maximum,
        "average": average
    }


scores = [
    72,
    88,
    91,
    65,
    84
]

summary = summarize(scores)

print(summary)

print(
    "Average:",
    summary["average"]
)`,

        explanation: [
          "summarize accepts a collection through the values parameter.",
          "The empty-list condition prevents division by zero.",
          "The function returns a dictionary instead of only printing results.",
          "The caller can therefore reuse individual summary values later.",
          "This pattern is useful when building reusable analysis utilities.",
        ],

        commonMistakes: [
          "Printing when a reusable result should be returned.",
          "Forgetting to handle invalid or empty input.",
          "Using global variables unnecessarily.",
        ],
      },
    ],

    practice: [
      {
        id: "python-functions-practice-1",
        title: "Print vs Return",
        type: "concept",
        difficulty: "basic",
        question:
          "Explain the difference between print(x) and return x inside a function.",
        instructions: [
          "Explain who receives the value in each case.",
        ],
        hints: [
          "One displays output; the other gives a result to the caller.",
        ],
        explanation:
          "print displays information, while return sends a value back to the caller so it can be stored or used in later computation.",
      },

      {
        id: "python-functions-practice-2",
        title: "Create an Average Function",
        type: "coding",
        difficulty: "basic",
        question:
          "Write a function average(values) that returns the arithmetic mean of a non-empty list.",
        instructions: [
          "Use sum and len.",
          "Return the result.",
        ],
        hints: [
          "mean = sum(values) / len(values).",
        ],
        explanation:
          "The function can return sum(values) / len(values). A robust version should also decide how empty input is handled.",
      },

      {
        id: "python-functions-practice-3",
        title: "Default Parameter",
        type: "coding",
        difficulty: "basic",
        question:
          "Write normalize(value, maximum=100) that returns value / maximum.",
        instructions: [
          "Give maximum a default value.",
        ],
        hints: [
          "Use def normalize(value, maximum=100):",
        ],
        explanation:
          "A valid implementation is def normalize(value, maximum=100): return value / maximum.",
      },

      {
        id: "python-functions-practice-4",
        title: "Scope Reasoning",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why is a function that secretly modifies many global variables harder to test than one that receives inputs and returns outputs?",
        instructions: [
          "Discuss hidden dependencies.",
          "Discuss predictability.",
        ],
        hints: [
          "The same function call may depend on unrelated external state.",
        ],
        explanation:
          "Explicit inputs and outputs make behavior easier to understand and reproduce. Hidden global dependencies can change behavior without being visible at the call site.",
      },

      {
        id: "python-functions-practice-5",
        title: "Build an ML Metric Utility",
        type: "coding",
        difficulty: "medium",
        question:
          "Write a function error_rate(actual, predicted) that returns the fraction of positions where the two lists differ.",
        instructions: [
          "Ensure the lists have compatible lengths.",
          "Count mismatches.",
          "Return mismatches divided by number of observations.",
        ],
        hints: [
          "zip(actual, predicted) can pair values.",
        ],
        explanation:
          "A correct implementation compares paired values, counts mismatches and divides by the total number of observations.",
      },
    ],

    keyTakeaways: [
      "Functions organize reusable behavior.",
      "Parameters define inputs.",
      "Arguments provide actual values.",
      "return is different from print.",
      "Local scope reduces accidental dependencies.",
      "Default and keyword arguments can improve function usability.",
      "Small reusable functions are valuable in ML workflows.",
    ],
  },


  // =========================================================
  // PYTHON FOR DATA
  // =========================================================

  "python-for-data": {
    overview:
      "Python for data work involves more than basic syntax. Real datasets require iteration, transformations, structured records, sorting, filtering and reusable processing patterns. This lesson connects core Python with the style of thinking needed before NumPy and Pandas.",

    objectives: [
      "Process collections of structured records.",
      "Filter and transform data using Python.",
      "Use enumerate and zip.",
      "Sort records using custom keys.",
      "Create derived values.",
      "Write reusable data-processing functions.",
      "Understand why vectorized libraries are later introduced.",
    ],

    sections: [
      {
        id: "python-for-data-records",
        title: "Representing Records",

        explanation: [
          "Small datasets can be represented using lists of dictionaries.",
          "Each dictionary can represent one row and dictionary keys can represent columns.",
          "This structure resembles records obtained from JSON APIs.",
          "Although Pandas becomes more convenient for larger tabular operations, understanding the underlying records is valuable.",
        ],

        intuition: [
          "A list of dictionaries is similar to a simple table represented using ordinary Python objects.",
        ],

        importantPoints: [
          "One dictionary can represent one observation.",
          "Dictionary keys can represent fields.",
          "A list can hold many records.",
        ],
      },

      {
        id: "python-for-data-filter",
        title: "Filtering and Transformation",

        explanation: [
          "Filtering means selecting observations that satisfy a condition.",
          "Transformation means deriving new values from existing information.",
          "Python loops and comprehensions can implement both operations.",
          "The same concepts later appear in NumPy Boolean indexing and Pandas filtering.",
        ],

        intuition: [
          "Filtering answers which rows should remain, while transformation answers how values should change.",
        ],

        importantPoints: [
          "Keep filtering conditions explicit.",
          "Do not overwrite raw data unnecessarily.",
          "Check transformed results.",
        ],
      },

      {
        id: "python-for-data-zip",
        title: "enumerate and zip",

        explanation: [
          "enumerate provides both an index and an item while iterating.",
          "zip combines corresponding items from multiple iterables.",
          "These tools reduce manual index management.",
          "They are useful when processing paired labels, predictions or related feature sequences.",
        ],

        intuition: [
          "enumerate attaches positions to values, while zip walks through multiple sequences together.",
        ],

        importantPoints: [
          "enumerate avoids manually incrementing an index.",
          "zip pairs corresponding values.",
          "zip stops when the shortest iterable is exhausted.",
        ],
      },

      {
        id: "python-for-data-sorting",
        title: "Sorting Structured Data",

        explanation: [
          "Python can sort simple values directly.",
          "Structured records often require a key function that specifies which field should control ordering.",
          "sorted() returns a new sorted collection.",
          "The reverse parameter can switch between ascending and descending order.",
        ],

        intuition: [
          "Sorting records requires answering which property should determine their order.",
        ],

        importantPoints: [
          "Use key to specify sorting logic.",
          "Use reverse=True for descending order.",
          "Preserve raw data when appropriate by using sorted().",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-data-processing-pipeline",
      title: "Python Data Processing Pipeline",
      description:
        "Watch raw records move through filtering, transformation, sorting and aggregation stages.",
    },

    codeExamples: [
      {
        id: "python-for-data-code",
        title: "Process a Small Dataset with Pure Python",
        description:
          "Filter, transform, sort and summarize structured records.",
        language: "python",

        code: `students = [
    {
        "name": "Aarav",
        "marks": 82
    },
    {
        "name": "Riya",
        "marks": 94
    },
    {
        "name": "Kabir",
        "marks": 61
    },
    {
        "name": "Meera",
        "marks": 76
    }
]

# Filter
qualified = [
    student
    for student in students
    if student["marks"] >= 75
]

# Transform
for student in qualified:
    student["normalized"] = (
        student["marks"] / 100
    )

# Sort
ranked = sorted(
    qualified,
    key=lambda student:
        student["marks"],
    reverse=True
)

for rank, student in enumerate(
    ranked,
    start=1
):
    print(
        rank,
        student["name"],
        student["marks"],
        student["normalized"]
    )`,

        explanation: [
          "The list comprehension performs filtering.",
          "The loop creates a derived normalized value.",
          "sorted uses marks as the sorting key.",
          "reverse=True ranks higher scores first.",
          "enumerate generates human-friendly rank numbers.",
        ],

        commonMistakes: [
          "Changing raw records unintentionally.",
          "Sorting using the wrong field.",
          "Writing deeply nested loops for operations that can be expressed more clearly.",
        ],
      },
    ],

    practice: [
      {
        id: "python-for-data-practice-1",
        title: "Filter Records",
        type: "coding",
        difficulty: "basic",
        question:
          "Given a list of dictionaries containing product and price, create a list containing only products with price >= 500.",
        instructions: [
          "Use a loop or comprehension.",
        ],
        hints: [
          "Check record['price'].",
        ],
        explanation:
          "Filtering requires keeping only records whose price field satisfies the condition.",
      },

      {
        id: "python-for-data-practice-2",
        title: "Create a Derived Feature",
        type: "coding",
        difficulty: "medium",
        question:
          "Each employee record contains salary and years. Create a salary_per_year field while safely handling years = 0.",
        instructions: [
          "Avoid division by zero.",
          "Decide what value should represent an undefined result.",
        ],
        hints: [
          "Use a condition before division.",
        ],
        explanation:
          "Check whether years is greater than zero before division. For zero years, use an explicit policy such as None rather than allowing invalid arithmetic.",
      },

      {
        id: "python-for-data-practice-3",
        title: "Pair Labels and Predictions",
        type: "coding",
        difficulty: "medium",
        question:
          "Given actual = [1, 0, 1] and predicted = [1, 1, 1], use zip to print each actual-predicted pair.",
        instructions: [
          "Iterate over zip(actual, predicted).",
        ],
        hints: [
          "Each iteration returns two values.",
        ],
        explanation:
          "for actual_value, predicted_value in zip(actual, predicted) provides corresponding pairs.",
      },

      {
        id: "python-for-data-practice-4",
        title: "Sort Experiments",
        type: "coding",
        difficulty: "medium",
        question:
          "Sort a list of experiment dictionaries by accuracy from highest to lowest.",
        instructions: [
          "Use sorted.",
          "Provide a key function.",
          "Use reverse=True.",
        ],
        hints: [
          "The key should return experiment['accuracy'].",
        ],
        explanation:
          "sorted(experiments, key=lambda item: item['accuracy'], reverse=True) ranks experiments by decreasing accuracy.",
      },

      {
        id: "python-for-data-practice-5",
        title: "Why NumPy and Pandas?",
        type: "analysis",
        difficulty: "medium",
        question:
          "If ordinary Python can process records, why are NumPy and Pandas still important for data science?",
        instructions: [
          "Discuss convenience.",
          "Discuss numerical operations.",
          "Discuss tabular data.",
        ],
        hints: [
          "Think about large arrays, vectorization and column-oriented operations.",
        ],
        explanation:
          "Pure Python is fundamental, but NumPy provides efficient numerical arrays and vectorized operations while Pandas provides powerful labeled tabular structures and data-manipulation tools.",
      },
    ],

    keyTakeaways: [
      "Python collections can represent small structured datasets.",
      "Filtering selects observations.",
      "Transformation derives new information.",
      "enumerate and zip simplify common iteration patterns.",
      "Sorting structured records requires a key.",
      "These concepts transfer directly into NumPy and Pandas.",
    ],
  },


  // =========================================================
  // PYTHON ERROR HANDLING
  // =========================================================

  "python-error-handling": {
    overview:
      "Real programs encounter invalid input, missing files, incorrect types and unexpected data. Error handling allows software to respond deliberately rather than crashing blindly or hiding failures.",

    objectives: [
      "Differentiate syntax errors and runtime exceptions.",
      "Use try and except.",
      "Catch specific exception types.",
      "Use else and finally.",
      "Raise exceptions intentionally.",
      "Validate function inputs.",
      "Avoid silently swallowing important errors.",
    ],

    sections: [
      {
        id: "python-errors-types",
        title: "Errors and Exceptions",

        explanation: [
          "Syntax errors occur when Python cannot parse the program structure.",
          "Exceptions occur during execution when an operation cannot be completed normally.",
          "Examples include ValueError, TypeError, ZeroDivisionError, KeyError and FileNotFoundError.",
          "The exception type provides information about what failed.",
        ],

        intuition: [
          "An exception is Python reporting that normal execution cannot continue through the current operation.",
        ],

        importantPoints: [
          "Read the exception type.",
          "Read the traceback.",
          "Fix root causes rather than hiding errors.",
        ],
      },

      {
        id: "python-errors-try",
        title: "try and except",

        explanation: [
          "Statements that may raise an expected exception can be placed inside a try block.",
          "An except block handles matching exceptions.",
          "Catching specific exception types is usually better than using a broad except because it makes intended behavior explicit.",
          "Error handling should not be used to conceal programming mistakes.",
        ],

        intuition: [
          "try means attempt this operation; except defines what should happen if a known failure occurs.",
        ],

        importantPoints: [
          "Catch exceptions you know how to handle.",
          "Prefer specific exception types.",
          "Do not use empty except blocks.",
        ],
      },

      {
        id: "python-errors-else-finally",
        title: "else and finally",

        explanation: [
          "The else block executes when the try block finishes without raising an exception.",
          "The finally block executes regardless of whether an exception occurred.",
          "finally is useful for cleanup actions that should happen in either outcome.",
        ],

        intuition: [
          "else represents successful completion; finally represents cleanup that must happen either way.",
        ],

        importantPoints: [
          "else separates successful follow-up logic.",
          "finally runs in both success and failure paths.",
        ],
      },

      {
        id: "python-errors-raise",
        title: "Raising Your Own Exceptions",

        explanation: [
          "Functions should sometimes reject invalid input explicitly.",
          "raise allows a program to create an exception deliberately.",
          "For example, a function expecting a positive learning rate can raise ValueError when a non-positive value is supplied.",
          "Clear validation errors make debugging easier.",
        ],

        intuition: [
          "Instead of allowing invalid input to create confusing results later, reject it where the requirement is known.",
        ],

        importantPoints: [
          "Validate important assumptions.",
          "Use meaningful exception types.",
          "Write useful error messages.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-exception-flow-explorer",
      title: "Exception Flow Explorer",
      description:
        "Follow execution through try, except, else and finally under successful and failing inputs.",
    },

    codeExamples: [
      {
        id: "python-error-handling-code",
        title: "Safe Numerical Input",
        description:
          "Validate input and handle expected conversion failures.",
        language: "python",

        code: `def calculate_ratio(
    numerator,
    denominator
):
    if denominator == 0:
        raise ValueError(
            "denominator cannot be zero"
        )

    return numerator / denominator


try:
    numerator = float(
        input("Numerator: ")
    )

    denominator = float(
        input("Denominator: ")
    )

    result = calculate_ratio(
        numerator,
        denominator
    )

except ValueError as error:
    print(
        "Invalid value:",
        error
    )

else:
    print(
        "Result:",
        result
    )

finally:
    print(
        "Calculation attempt finished."
    )`,

        explanation: [
          "float conversion may raise ValueError for invalid numerical text.",
          "calculate_ratio deliberately raises ValueError when the denominator is zero.",
          "except handles the expected failure.",
          "else executes only when the try block succeeds.",
          "finally runs in both cases.",
        ],

        commonMistakes: [
          "Using except: pass and hiding every failure.",
          "Catching Exception everywhere without understanding the failure.",
          "Returning invalid results instead of validating assumptions.",
        ],
      },
    ],

    practice: [
      {
        id: "python-error-practice-1",
        title: "Identify the Exception",
        type: "analysis",
        difficulty: "basic",
        question:
          "What exception is normally raised by int('hello')?",
        instructions: [
          "Think about conversion.",
        ],
        hints: [
          "The text is not a valid integer representation.",
        ],
        explanation:
          "Python raises ValueError because the string value cannot be interpreted as an integer.",
      },

      {
        id: "python-error-practice-2",
        title: "Division Safety",
        type: "coding",
        difficulty: "basic",
        question:
          "Write code that catches ZeroDivisionError when dividing a by b.",
        instructions: [
          "Place the division inside try.",
          "Catch ZeroDivisionError.",
        ],
        hints: [
          "Use except ZeroDivisionError:",
        ],
        explanation:
          "The expected division operation belongs in try and the specific zero-division case can be handled with except ZeroDivisionError.",
      },

      {
        id: "python-error-practice-3",
        title: "Why Broad except Is Risky",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can except: pass make debugging extremely difficult?",
        instructions: [
          "Explain what happens to unexpected failures.",
        ],
        hints: [
          "The program receives no visible information about the failure.",
        ],
        explanation:
          "It silently hides every exception, including genuine programming bugs, leaving the program in an unknown or incorrect state without useful diagnostics.",
      },

      {
        id: "python-error-practice-4",
        title: "Validate a Hyperparameter",
        type: "coding",
        difficulty: "medium",
        question:
          "Write validate_learning_rate(lr) that raises ValueError unless 0 < lr <= 1.",
        instructions: [
          "Check the allowed interval.",
          "Use raise ValueError with a useful message.",
        ],
        hints: [
          "Invalid means lr <= 0 or lr > 1.",
        ],
        explanation:
          "Reject invalid values immediately so later optimization code does not operate using an impossible learning rate.",
      },

      {
        id: "python-error-practice-5",
        title: "Design Robust File Logic",
        type: "analysis",
        difficulty: "medium",
        question:
          "A data-loading function receives a path that may not exist. Which exception should you expect and why should the function not simply return an empty dataset silently?",
        instructions: [
          "Name the relevant exception.",
          "Discuss why silent fallback can be dangerous.",
        ],
        hints: [
          "Python has a specific missing-file exception.",
        ],
        explanation:
          "FileNotFoundError is expected. Silently returning empty data can make later analysis appear valid while operating on the wrong input; the failure should be handled explicitly.",
      },
    ],

    keyTakeaways: [
      "Exceptions represent runtime failures.",
      "Tracebacks contain useful debugging information.",
      "try/except handles expected failures.",
      "Catch specific exceptions where possible.",
      "else represents successful completion.",
      "finally supports cleanup.",
      "raise allows functions to enforce valid assumptions.",
      "Never hide errors merely to make code appear to run.",
    ],
  },


  // =========================================================
  // PYTHON OOP
  // =========================================================

  "python-oop": {
    overview:
      "Object-oriented programming groups related state and behavior into objects. In machine learning, estimators, transformers, datasets and experiment abstractions often follow object-oriented patterns. Understanding classes makes libraries such as scikit-learn much easier to reason about.",

    objectives: [
      "Differentiate classes and objects.",
      "Use __init__ and instance attributes.",
      "Create instance methods.",
      "Understand self.",
      "Understand encapsulation at a practical level.",
      "Understand inheritance.",
      "Connect OOP concepts with scikit-learn estimators.",
    ],

    sections: [
      {
        id: "python-oop-class-object",
        title: "Classes and Objects",

        explanation: [
          "A class defines the structure and behavior associated with a type of object.",
          "An object is an instance created from a class.",
          "Different objects from the same class can hold different state.",
          "Classes are useful when data and operations naturally belong together.",
        ],

        intuition: [
          "A class is a blueprint; an object is a particular instance created using that blueprint.",
        ],

        importantPoints: [
          "Class defines structure.",
          "Object represents an instance.",
          "Objects can hold state through attributes.",
        ],
      },

      {
        id: "python-oop-init",
        title: "__init__ and self",

        explanation: [
          "__init__ runs when a new object is initialized.",
          "self refers to the current instance.",
          "Assignments such as self.name = name store information on that instance.",
          "Instance methods receive self so they can read or modify object state.",
        ],

        intuition: [
          "self tells Python which particular object a method is currently working with.",
        ],

        importantPoints: [
          "__init__ initializes instance state.",
          "self refers to the current object.",
          "Instance attributes can differ between objects.",
        ],
      },

      {
        id: "python-oop-methods",
        title: "Methods and Encapsulation",

        explanation: [
          "Methods are functions associated with a class.",
          "They can use and update instance state.",
          "Grouping related operations inside a class can create a cleaner interface.",
          "Encapsulation means keeping related state and behavior together and controlling how callers interact with that state.",
        ],

        intuition: [
          "Instead of passing the same related values between many independent functions, an object can own those values and expose meaningful operations.",
        ],

        importantPoints: [
          "Methods represent behavior.",
          "Attributes represent state.",
          "Good classes expose meaningful responsibilities.",
        ],
      },

      {
        id: "python-oop-inheritance",
        title: "Inheritance",

        explanation: [
          "Inheritance allows one class to build on behavior defined by another class.",
          "A child class can reuse or override parent behavior.",
          "Inheritance is useful when there is a genuine is-a relationship.",
          "Composition is often preferable when objects merely need to work together rather than represent specialized forms of one another.",
        ],

        intuition: [
          "Inheritance lets a specialized type start with the capabilities of a more general type and then add or change behavior.",
        ],

        importantPoints: [
          "Inheritance supports reuse.",
          "Methods can be overridden.",
          "Do not use inheritance merely to avoid writing a few lines of code.",
        ],
      },

      {
        id: "python-oop-sklearn",
        title: "OOP in Machine Learning Libraries",

        explanation: [
          "scikit-learn models are objects created from estimator classes.",
          "LogisticRegression() creates an estimator object.",
          "fit(), predict() and predict_proba() are methods.",
          "Model hyperparameters become part of estimator configuration.",
          "After fitting, learned information is stored on the estimator object.",
        ],

        intuition: [
          "When you write model.fit(X, y), you are already using object-oriented programming.",
        ],

        importantPoints: [
          "Estimator classes create model objects.",
          "fit changes learned model state.",
          "predict uses learned state.",
          "Understanding objects makes sklearn APIs easier to understand.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-oop-object-explorer",
      title: "Class and Object Explorer",
      description:
        "Create multiple objects from one class and observe how instance attributes and methods behave independently.",
    },

    codeExamples: [
      {
        id: "python-oop-code",
        title: "A Tiny ML-Style Estimator",
        description:
          "Build a small class using an API similar to machine-learning estimators.",
        language: "python",

        code: `class MeanPredictor:
    def __init__(self):
        self.mean_ = None

    def fit(self, y):
        if len(y) == 0:
            raise ValueError(
                "y cannot be empty"
            )

        self.mean_ = (
            sum(y) / len(y)
        )

        return self

    def predict(self, n_samples):
        if self.mean_ is None:
            raise ValueError(
                "Call fit before predict"
            )

        return [
            self.mean_
            for _ in range(n_samples)
        ]


model = MeanPredictor()

model.fit(
    [10, 12, 14, 16]
)

predictions = model.predict(3)

print(
    "Learned mean:",
    model.mean_
)

print(
    "Predictions:",
    predictions
)`,

        explanation: [
          "MeanPredictor is a class.",
          "model is one instance of that class.",
          "__init__ creates the initial object state.",
          "fit learns a value from training data and stores it in self.mean_.",
          "predict uses that learned state later.",
          "This mirrors the broad fit/predict style used throughout scikit-learn.",
        ],

        commonMistakes: [
          "Forgetting self in instance methods.",
          "Using local variables when learned state needs to remain on the object.",
          "Calling prediction before fitting.",
        ],
      },
    ],

    practice: [
      {
        id: "python-oop-practice-1",
        title: "Class vs Object",
        type: "concept",
        difficulty: "basic",
        question:
          "Explain the difference between LogisticRegression as a class and model = LogisticRegression() as an object.",
        instructions: [
          "Use the blueprint-instance idea.",
        ],
        hints: [
          "The parentheses create an instance.",
        ],
        explanation:
          "LogisticRegression refers to the estimator class, while LogisticRegression() constructs a particular estimator object with its own configuration and later learned state.",
      },

      {
        id: "python-oop-practice-2",
        title: "Create a Student Class",
        type: "coding",
        difficulty: "basic",
        question:
          "Create a Student class storing name and marks, with a method passed() that returns whether marks >= 40.",
        instructions: [
          "Use __init__.",
          "Store attributes using self.",
        ],
        hints: [
          "self.marks can be checked inside passed().",
        ],
        explanation:
          "The constructor stores name and marks, and passed can return self.marks >= 40.",
      },

      {
        id: "python-oop-practice-3",
        title: "Independent Objects",
        type: "analysis",
        difficulty: "medium",
        question:
          "If two Student objects are created from the same class, why can they have different names and marks?",
        instructions: [
          "Discuss instance state.",
        ],
        hints: [
          "Each object has its own attributes.",
        ],
        explanation:
          "The class defines the common structure, but each instance stores its own attribute values.",
      },

      {
        id: "python-oop-practice-4",
        title: "Estimator State",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why does a machine-learning estimator need to store learned information after fit()?",
        instructions: [
          "Connect training with later prediction.",
        ],
        hints: [
          "predict() must use what was learned from training data.",
        ],
        explanation:
          "Training estimates parameters or other learned structures. The estimator stores them so later predictions can apply the learned model without retraining.",
      },

      {
        id: "python-oop-practice-5",
        title: "Build a Min-Max Tracker",
        type: "coding",
        difficulty: "medium",
        question:
          "Create a class RangeTracker with fit(values) that stores minimum and maximum, and describe(values) that returns both learned values.",
        instructions: [
          "Initialize learned attributes.",
          "Update them during fit.",
          "Reject empty input.",
        ],
        hints: [
          "Use min(values) and max(values).",
        ],
        explanation:
          "This exercise reinforces how an object can learn state during fit and expose that state through another method.",
      },
    ],

    keyTakeaways: [
      "Classes define object structure and behavior.",
      "Objects are instances of classes.",
      "__init__ initializes state.",
      "self refers to the current instance.",
      "Methods operate on object state.",
      "Inheritance can specialize existing behavior.",
      "scikit-learn estimators are object-oriented APIs.",
      "fit and predict become easier to understand once estimator state is clear.",
    ],
  },


  // =========================================================
  // ADVANCED PYTHON
  // =========================================================

  "python-advanced": {
    overview:
      "Advanced Python for ML engineering focuses on writing cleaner, safer and more maintainable programs. This lesson introduces iterators, generators, context managers, decorators, type hints and practical code-organization principles without losing sight of data-science use cases.",

    objectives: [
      "Understand iterables and iterators.",
      "Use generators for lazy processing.",
      "Understand context managers.",
      "Understand decorators conceptually.",
      "Use type hints to communicate intent.",
      "Write cleaner reusable Python modules.",
      "Recognize when advanced features improve ML engineering code.",
    ],

    sections: [
      {
        id: "python-advanced-iterators",
        title: "Iterables and Iterators",

        explanation: [
          "An iterable is an object that can be iterated over.",
          "Lists, tuples, dictionaries and many library objects are iterable.",
          "An iterator produces values one at a time and maintains iteration state.",
          "Understanding this distinction helps explain loops and lazy data-processing APIs.",
        ],

        intuition: [
          "An iterable is something you can request an iterator from; the iterator is the object that remembers where iteration currently is.",
        ],

        importantPoints: [
          "for loops rely on iteration protocol behavior.",
          "Iterators produce values sequentially.",
          "An exhausted iterator does not automatically restart.",
        ],
      },

      {
        id: "python-advanced-generators",
        title: "Generators",

        explanation: [
          "Generators produce values lazily rather than constructing every result immediately.",
          "A generator function uses yield.",
          "Execution pauses at yield and continues when another value is requested.",
          "Generators can reduce memory usage for large streams or batch-processing workflows.",
        ],

        intuition: [
          "A generator produces the next value only when it is needed instead of preparing the entire collection first.",
        ],

        importantPoints: [
          "yield produces values lazily.",
          "Generators can process large sequences incrementally.",
          "Generators are usually consumed once.",
        ],
      },

      {
        id: "python-advanced-context",
        title: "Context Managers",

        explanation: [
          "Context managers define setup and cleanup around a block of code.",
          "The with statement is the most common way to use them.",
          "File handling commonly uses with so the file is closed reliably.",
          "Similar patterns can manage temporary resources, locks and connections.",
        ],

        intuition: [
          "A context manager says acquire this resource, use it here, then clean it up reliably.",
        ],

        importantPoints: [
          "with improves resource safety.",
          "Cleanup occurs even when the block encounters many kinds of failure.",
        ],
      },

      {
        id: "python-advanced-decorators",
        title: "Decorators",

        explanation: [
          "A decorator wraps or modifies callable behavior without rewriting the original function body.",
          "Decorators are frequently used for logging, timing, caching, authorization and framework behavior.",
          "For ML engineering, timing or experiment-logging decorators can be useful.",
          "Decorators should be used when they improve clarity rather than merely because they are advanced syntax.",
        ],

        intuition: [
          "A decorator adds behavior around a function call.",
        ],

        importantPoints: [
          "Decorators operate on callables.",
          "They can add reusable cross-cutting behavior.",
          "Overuse can make control flow harder to understand.",
        ],
      },

      {
        id: "python-advanced-types",
        title: "Type Hints and Maintainability",

        explanation: [
          "Python remains dynamically typed, but type hints allow developers to document expected types.",
          "Type hints improve editor support and static checking.",
          "They are especially useful in larger applications where many components exchange structured values.",
          "Type hints do not automatically validate values at runtime.",
        ],

        intuition: [
          "Type hints communicate what a function expects and returns before someone has to inspect its implementation.",
        ],

        importantPoints: [
          "Type hints improve communication.",
          "Static tools can detect some mistakes earlier.",
          "Hints do not replace runtime validation.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "python-generator-memory-explorer",
      title: "Generator and Execution Explorer",
      description:
        "Compare eager list construction with lazy generator execution and observe when values are actually produced.",
    },

    codeExamples: [
      {
        id: "python-advanced-code",
        title: "Lazy Batch Generator",
        description:
          "Create batches lazily using a generator.",
        language: "python",

        code: `from typing import Iterator


def batches(
    values: list[int],
    batch_size: int
) -> Iterator[list[int]]:
    if batch_size <= 0:
        raise ValueError(
            "batch_size must be positive"
        )

    for start in range(
        0,
        len(values),
        batch_size
    ):
        yield values[
            start:
            start + batch_size
        ]


data = list(
    range(1, 11)
)

for batch in batches(
    data,
    batch_size=3
):
    print(batch)`,

        explanation: [
          "The function contains yield, making it a generator function.",
          "Each batch is produced only when requested during iteration.",
          "The type hint communicates that the function yields lists of integers.",
          "The input validation prevents invalid batch sizes.",
          "Batch-based processing is common when datasets are too large to process all at once.",
        ],

        commonMistakes: [
          "Expecting a generator to behave exactly like a reusable list.",
          "Using advanced syntax where simple code would be clearer.",
          "Assuming type hints automatically enforce runtime types.",
        ],
      },
    ],

    practice: [
      {
        id: "python-advanced-practice-1",
        title: "List vs Generator",
        type: "concept",
        difficulty: "medium",
        question:
          "What is the key memory-related difference between building a large list and producing values with a generator?",
        instructions: [
          "Discuss eager versus lazy creation.",
        ],
        hints: [
          "A generator does not normally construct all output values at once.",
        ],
        explanation:
          "A list materializes its elements in memory, while a generator can produce values lazily as they are requested.",
      },

      {
        id: "python-advanced-practice-2",
        title: "Write a Generator",
        type: "coding",
        difficulty: "medium",
        question:
          "Write a generator even_numbers(n) that yields even integers from 0 through n.",
        instructions: [
          "Use yield.",
          "Do not build and return a complete list.",
        ],
        hints: [
          "Iterate over a suitable range.",
        ],
        explanation:
          "A generator can iterate through the range and yield values satisfying the even-number condition.",
      },

      {
        id: "python-advanced-practice-3",
        title: "Safe File Reading",
        type: "coding",
        difficulty: "medium",
        question:
          "Why is with open(path) as file generally preferable to manually opening a file and forgetting to close it?",
        instructions: [
          "Discuss cleanup.",
        ],
        hints: [
          "The context manager controls resource lifetime.",
        ],
        explanation:
          "The context manager reliably closes the file when execution leaves the with block, reducing resource-management errors.",
      },

      {
        id: "python-advanced-practice-4",
        title: "Type Hint Meaning",
        type: "analysis",
        difficulty: "medium",
        question:
          "Does writing def predict(x: list[float]) -> float automatically prevent a caller from passing a string?",
        instructions: [
          "Differentiate static hints from runtime enforcement.",
        ],
        hints: [
          "Python remains dynamically typed.",
        ],
        explanation:
          "No. The annotation communicates intent and can be checked by tooling, but it does not automatically enforce the type at runtime.",
      },

      {
        id: "python-advanced-practice-5",
        title: "When Not to Be Clever",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can an overly complicated decorator/generator abstraction be harmful in a small ML preprocessing script?",
        instructions: [
          "Discuss readability and maintenance.",
        ],
        hints: [
          "Advanced syntax has a cognitive cost.",
        ],
        explanation:
          "Abstraction is valuable only when it reduces meaningful repetition or complexity. Unnecessary advanced constructs can make debugging and onboarding harder than straightforward code.",
      },
    ],

    keyTakeaways: [
      "Iterables and iterators power Python iteration.",
      "Generators provide lazy value production.",
      "Context managers manage resource lifetimes.",
      "Decorators add reusable behavior around callables.",
      "Type hints improve communication and static checking.",
      "Advanced Python should improve maintainability rather than make code unnecessarily clever.",
    ],
  },


  // =========================================================
  // NUMPY
  // =========================================================

  "numpy-foundation": {
    overview:
      "NumPy is the numerical foundation of the Python data-science ecosystem. It provides multidimensional arrays, vectorized operations, broadcasting, aggregation and numerical tools that are substantially more suitable for machine-learning mathematics than ordinary Python lists.",

    objectives: [
      "Understand NumPy ndarray objects.",
      "Create arrays.",
      "Inspect shape, dimensions and dtype.",
      "Use indexing and slicing.",
      "Perform vectorized arithmetic.",
      "Understand broadcasting.",
      "Use Boolean indexing.",
      "Use aggregation functions.",
      "Reshape arrays safely.",
      "Connect NumPy arrays with ML feature matrices.",
    ],

    sections: [
      {
        id: "numpy-array",
        title: "NumPy Arrays",

        explanation: [
          "The central NumPy object is ndarray.",
          "Unlike ordinary Python lists, NumPy arrays are designed for efficient numerical computation.",
          "An array has a shape describing its dimensions and a dtype describing how values are represented.",
          "Machine-learning feature matrices are commonly represented conceptually as two-dimensional arrays with rows as samples and columns as features.",
        ],

        intuition: [
          "Think of a NumPy array as a structured numerical grid with well-defined dimensions.",
        ],

        importantPoints: [
          "ndarray is NumPy's primary array structure.",
          "shape describes dimensions.",
          "ndim gives the number of axes.",
          "dtype describes the element representation.",
        ],
      },

      {
        id: "numpy-vectorization",
        title: "Vectorized Operations",

        explanation: [
          "NumPy can apply numerical operations across entire arrays without writing explicit Python loops for every element.",
          "This style is called vectorization.",
          "Expressions such as array * 2 or array + 5 operate element-wise.",
          "Vectorized code is often shorter and can be significantly faster because NumPy performs core work in optimized compiled implementations.",
        ],

        intuition: [
          "Instead of telling Python to visit each number manually, describe the numerical operation for the whole array.",
        ],

        importantPoints: [
          "Arithmetic is often element-wise.",
          "Vectorization reduces explicit Python loops.",
          "Array shapes still need to be compatible.",
        ],
      },

      {
        id: "numpy-broadcasting",
        title: "Broadcasting",

        explanation: [
          "Broadcasting allows NumPy to perform operations between arrays of different but compatible shapes.",
          "A scalar can be applied to every element of an array.",
          "A row or column-shaped array can sometimes be expanded conceptually across another dimension.",
          "Broadcasting is powerful but shape misunderstandings can create incorrect calculations.",
        ],

        intuition: [
          "NumPy can conceptually stretch certain dimensions of a smaller array without explicitly copying all of its values.",
        ],

        importantPoints: [
          "Broadcasting depends on shape compatibility.",
          "Always inspect shapes when results are surprising.",
          "Broadcasting is heavily used in numerical ML operations.",
        ],
      },

      {
        id: "numpy-indexing",
        title: "Indexing, Slicing and Boolean Masks",

        explanation: [
          "NumPy supports positional indexing and slicing similar to Python sequences.",
          "Multidimensional arrays can be indexed by row and column.",
          "Boolean masks allow values or rows to be selected according to conditions.",
          "Boolean filtering is a foundation for later Pandas filtering.",
        ],

        intuition: [
          "A Boolean mask is a parallel array of True and False values telling NumPy which elements should be selected.",
        ],

        importantPoints: [
          "Use commas to index dimensions.",
          "Boolean expressions can create masks.",
          "Masks can filter arrays.",
        ],
      },

      {
        id: "numpy-aggregation",
        title: "Aggregation and Axis",

        explanation: [
          "Aggregation reduces many values into summaries such as sum, mean, minimum, maximum or standard deviation.",
          "The axis argument controls the dimension along which reduction occurs.",
          "For a 2D feature matrix, axis=0 commonly summarizes each column while axis=1 commonly summarizes each row.",
          "Understanding axis is essential for NumPy and Pandas.",
        ],

        intuition: [
          "Axis tells NumPy which direction should collapse when calculating the summary.",
        ],

        importantPoints: [
          "axis=0 commonly produces column-wise summaries.",
          "axis=1 commonly produces row-wise summaries.",
          "Always reason about the resulting shape.",
        ],
      },

      {
        id: "numpy-reshape",
        title: "Reshaping",

        explanation: [
          "reshape changes the dimensional arrangement without changing the number of elements.",
          "Many ML APIs expect X to be two-dimensional even when there is only one feature.",
          "A one-dimensional array with shape (n,) differs from a column matrix with shape (n, 1).",
          "Shape mismatches are one of the most common sources of confusion in ML code.",
        ],

        intuition: [
          "Reshaping changes how the same values are organized, not what the values are.",
        ],

        importantPoints: [
          "Element count must remain compatible.",
          "(n,) and (n, 1) are different shapes.",
          "Inspect shape before passing arrays to ML APIs.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "numpy-array-broadcasting-explorer",
      title: "NumPy Array and Broadcasting Explorer",
      description:
        "Manipulate array shapes, slices, masks, axes and broadcasting operations while seeing the resulting dimensions in real time.",
    },

    codeExamples: [
      {
        id: "numpy-code-1",
        title: "Feature Matrix Operations",
        description:
          "Use NumPy to inspect and transform a small ML-style feature matrix.",
        language: "python",

        code: `import numpy as np

X = np.array([
    [20, 50000],
    [25, 62000],
    [30, 71000],
    [35, 85000]
])

print(
    "Shape:",
    X.shape
)

print(
    "Dimensions:",
    X.ndim
)

ages = X[:, 0]

salaries = X[:, 1]

print(
    "Ages:",
    ages
)

print(
    "Average salary:",
    salaries.mean()
)

high_salary_mask = (
    salaries >= 70000
)

print(
    "High salary rows:"
)

print(
    X[high_salary_mask]
)

column_means = X.mean(
    axis=0
)

print(
    "Column means:",
    column_means
)`,

        explanation: [
          "X has four samples and two features, so its shape is (4, 2).",
          "X[:, 0] selects every row from the first column.",
          "The comparison creates a Boolean mask.",
          "X[high_salary_mask] filters complete rows.",
          "mean(axis=0) calculates one mean per feature column.",
        ],

        commonMistakes: [
          "Confusing rows and columns.",
          "Using the wrong axis.",
          "Ignoring shape differences.",
          "Using Python list semantics when working with arrays.",
        ],
      },

      {
        id: "numpy-code-2",
        title: "Vectorization and Broadcasting",
        description:
          "Standardize a small array manually to understand the mathematics behind scaling.",
        language: "python",

        code: `import numpy as np

X = np.array([
    [10.0, 100.0],
    [20.0, 150.0],
    [30.0, 200.0]
])

means = X.mean(
    axis=0
)

stds = X.std(
    axis=0
)

X_scaled = (
    X - means
) / stds

print(
    "Means:",
    means
)

print(
    "Standard deviations:",
    stds
)

print(
    "Scaled data:"
)

print(
    X_scaled
)`,

        explanation: [
          "means has one value per column.",
          "stds also has one value per column.",
          "Broadcasting allows these vectors to operate across every row of X.",
          "The expression mirrors the core idea behind standardization.",
          "Later, StandardScaler will automate this process while handling ML workflow concerns.",
        ],

        commonMistakes: [
          "Standardizing using information from future test data.",
          "Dividing by zero when a feature has zero variance.",
          "Ignoring array shapes.",
        ],
      },
    ],

    practice: [
      {
        id: "numpy-practice-1",
        title: "Understand Shape",
        type: "analysis",
        difficulty: "basic",
        question:
          "What is the shape of np.array([[1, 2, 3], [4, 5, 6]])?",
        instructions: [
          "Count rows and columns.",
        ],
        hints: [
          "There are two inner lists.",
        ],
        explanation:
          "The shape is (2, 3): two rows and three columns.",
      },

      {
        id: "numpy-practice-2",
        title: "Column Selection",
        type: "coding",
        difficulty: "basic",
        question:
          "Given a 2D array X, write an expression selecting every row from column index 1.",
        instructions: [
          "Use multidimensional slicing.",
        ],
        hints: [
          "Use : for all rows.",
        ],
        explanation:
          "X[:, 1] selects every row and the second column.",
      },

      {
        id: "numpy-practice-3",
        title: "Boolean Filtering",
        type: "coding",
        difficulty: "medium",
        question:
          "Given values = np.array([3, 8, 2, 10, 7]), select only values greater than 5.",
        instructions: [
          "Create a Boolean condition.",
        ],
        hints: [
          "values > 5 creates a mask.",
        ],
        explanation:
          "values[values > 5] produces [8, 10, 7].",
      },

      {
        id: "numpy-practice-4",
        title: "Axis Reasoning",
        type: "analysis",
        difficulty: "medium",
        question:
          "For an ML feature matrix with shape (100, 5), what shape would X.mean(axis=0) normally produce and what do the values represent?",
        instructions: [
          "Think about collapsing rows.",
        ],
        hints: [
          "There are five feature columns.",
        ],
        explanation:
          "It produces shape (5,), containing the mean of each feature across the 100 samples.",
      },

      {
        id: "numpy-practice-5",
        title: "Reshape for One Feature",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why might an ML API reject X = np.array([1, 2, 3, 4]) when it expects a feature matrix?",
        instructions: [
          "Compare (4,) with (4, 1).",
        ],
        hints: [
          "Many estimators expect samples × features.",
        ],
        explanation:
          "The array is one-dimensional with shape (4,). A single-feature matrix is commonly represented with shape (4, 1), for example X.reshape(-1, 1).",
      },
    ],

    keyTakeaways: [
      "NumPy arrays are the foundation of numerical Python.",
      "shape and dtype describe array structure.",
      "Vectorization applies operations efficiently across arrays.",
      "Broadcasting combines compatible shapes.",
      "Boolean masks filter values.",
      "axis controls aggregation direction.",
      "Shape reasoning is essential for machine learning.",
    ],
  },


  // =========================================================
  // PANDAS
  // =========================================================

  "pandas-foundation": {
    overview:
      "Pandas provides labeled data structures designed for tabular data. DataFrames and Series make it easier to inspect, filter, transform, aggregate and prepare real datasets before machine-learning modeling.",

    objectives: [
      "Understand Series and DataFrame objects.",
      "Load tabular data.",
      "Inspect shape, columns, types and summary statistics.",
      "Select rows and columns.",
      "Use loc and iloc.",
      "Filter observations.",
      "Create and transform columns.",
      "Use groupby.",
      "Recognize missing values.",
      "Prepare data for later ML preprocessing.",
    ],

    sections: [
      {
        id: "pandas-series-dataframe",
        title: "Series and DataFrame",

        explanation: [
          "A Series is a one-dimensional labeled structure.",
          "A DataFrame is a two-dimensional labeled table.",
          "DataFrame columns can have different data types.",
          "Rows have an index and columns have labels.",
          "Most tabular ML datasets are conveniently explored using DataFrames.",
        ],

        intuition: [
          "A DataFrame resembles a spreadsheet table but provides programmable operations for selecting, transforming and analyzing data.",
        ],

        importantPoints: [
          "Series is one-dimensional.",
          "DataFrame is two-dimensional.",
          "Columns have labels.",
          "Rows have an index.",
        ],
      },

      {
        id: "pandas-inspection",
        title: "Inspecting a Dataset",

        explanation: [
          "Before modifying a dataset, inspect its structure.",
          "head() shows initial rows.",
          "shape shows the number of rows and columns.",
          "columns lists column names.",
          "dtypes shows inferred data types.",
          "info() summarizes non-null counts and types.",
          "describe() provides descriptive statistics for appropriate columns.",
        ],

        intuition: [
          "Dataset inspection is the equivalent of understanding the map before choosing a route.",
        ],

        importantPoints: [
          "Inspect before cleaning.",
          "Check types rather than assuming them.",
          "Check missingness and suspicious ranges.",
        ],
      },

      {
        id: "pandas-selection",
        title: "Selection with Columns, loc and iloc",

        explanation: [
          "Selecting one column usually returns a Series.",
          "Selecting a list of columns returns a DataFrame.",
          "loc is label-oriented.",
          "iloc is position-oriented.",
          "Explicit selection makes analysis easier to read and reduces accidental operations on unrelated columns.",
        ],

        intuition: [
          "loc asks for labeled locations, while iloc asks for numerical positions.",
        ],

        importantPoints: [
          "df['age'] selects one column.",
          "df[['age', 'salary']] selects multiple columns.",
          "loc uses labels.",
          "iloc uses integer positions.",
        ],
      },

      {
        id: "pandas-filter",
        title: "Filtering Rows",

        explanation: [
          "Boolean conditions can select rows satisfying criteria.",
          "Multiple conditions can be combined using & and | with parentheses.",
          "Filtering is essential for subgroup analysis and data validation.",
          "Filtering should be based on meaningful rules rather than arbitrary removal of inconvenient observations.",
        ],

        intuition: [
          "A Boolean filter creates a True/False decision for each row.",
        ],

        importantPoints: [
          "Use parentheses around combined conditions.",
          "Use & for element-wise AND.",
          "Use | for element-wise OR.",
        ],
      },

      {
        id: "pandas-groupby",
        title: "Grouping and Aggregation",

        explanation: [
          "groupby implements split-apply-combine style analysis.",
          "Rows are split into groups according to one or more keys.",
          "An aggregation such as mean, sum or count is applied within each group.",
          "The results are combined into a summarized structure.",
          "Grouping is a major part of EDA.",
        ],

        intuition: [
          "Instead of calculating one average for the whole dataset, groupby can calculate separate averages for each category.",
        ],

        importantPoints: [
          "Choose meaningful grouping variables.",
          "Choose aggregations appropriate to the measurement.",
          "Inspect group sizes before interpreting group statistics.",
        ],
      },

      {
        id: "pandas-transform",
        title: "Creating and Transforming Columns",

        explanation: [
          "New features can be created from existing columns.",
          "Vectorized column operations are usually preferable to manual row loops.",
          "String and datetime accessors provide specialized transformations.",
          "Feature creation should be based on information that will legitimately be available at prediction time.",
        ],

        intuition: [
          "A derived column turns existing raw information into a representation that may be easier to analyze or model.",
        ],

        importantPoints: [
          "Prefer vectorized operations where possible.",
          "Give derived features meaningful names.",
          "Avoid target leakage while creating features.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "pandas-dataframe-operation-explorer",
      title: "Pandas DataFrame Explorer",
      description:
        "Interact with a table using selection, filtering, grouping, sorting and column transformations while observing how the DataFrame changes.",
    },

    codeExamples: [
      {
        id: "pandas-code-1",
        title: "Inspect and Analyze a DataFrame",
        description:
          "Build a small DataFrame and perform common analytical operations.",
        language: "python",

        code: `import pandas as pd

df = pd.DataFrame({
    "name": [
        "Aarav",
        "Riya",
        "Kabir",
        "Meera",
        "Ishaan"
    ],
    "branch": [
        "AIML",
        "CSE",
        "AIML",
        "CSE",
        "AIML"
    ],
    "marks": [
        82,
        94,
        61,
        76,
        88
    ],
    "attendance": [
        91,
        96,
        72,
        84,
        89
    ]
})

print(df.head())

print(
    "Shape:",
    df.shape
)

print(
    df.dtypes
)

high_performers = df[
    (df["marks"] >= 80)
    &
    (df["attendance"] >= 80)
]

print(
    high_performers
)

branch_summary = (
    df
    .groupby("branch")["marks"]
    .mean()
)

print(
    branch_summary
)

df["marks_fraction"] = (
    df["marks"] / 100
)

print(
    df[
        [
            "name",
            "marks",
            "marks_fraction"
        ]
    ]
)`,

        explanation: [
          "DataFrame constructs a labeled table.",
          "shape reveals dataset dimensions.",
          "dtypes reveals how Pandas represents each column.",
          "The Boolean expression filters rows using two conditions.",
          "groupby calculates average marks separately by branch.",
          "marks_fraction demonstrates vectorized feature creation.",
        ],

        commonMistakes: [
          "Skipping dataset inspection.",
          "Combining conditions without parentheses.",
          "Treating numerical-looking strings as genuine numeric columns.",
          "Changing data without checking the result.",
        ],
      },
    ],

    practice: [
      {
        id: "pandas-practice-1",
        title: "Series or DataFrame?",
        type: "concept",
        difficulty: "basic",
        question:
          "What is the usual difference between df['age'] and df[['age']]?",
        instructions: [
          "Discuss dimensionality.",
        ],
        hints: [
          "One selects a single labeled vector while the other selects a list of columns.",
        ],
        explanation:
          "df['age'] usually returns a Series, while df[['age']] returns a one-column DataFrame.",
      },

      {
        id: "pandas-practice-2",
        title: "Filter Rows",
        type: "coding",
        difficulty: "basic",
        question:
          "Write a Pandas expression selecting rows where age >= 18 and city == 'Agra'.",
        instructions: [
          "Use two Boolean conditions.",
          "Use parentheses.",
        ],
        hints: [
          "Combine conditions with &.",
        ],
        explanation:
          "df[(df['age'] >= 18) & (df['city'] == 'Agra')] is a standard solution.",
      },

      {
        id: "pandas-practice-3",
        title: "Group Analysis",
        type: "coding",
        difficulty: "medium",
        question:
          "Given columns department and salary, calculate average salary for each department.",
        instructions: [
          "Use groupby.",
          "Select salary.",
          "Calculate mean.",
        ],
        hints: [
          "df.groupby('department')['salary'].mean()",
        ],
        explanation:
          "Grouping by department and aggregating salary with mean returns one average for each department.",
      },

      {
        id: "pandas-practice-4",
        title: "Inspect Before Cleaning",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why should you inspect dtypes, missing values and summary statistics before applying cleaning operations?",
        instructions: [
          "Discuss incorrect assumptions.",
        ],
        hints: [
          "A column may not contain the type or range you expect.",
        ],
        explanation:
          "Cleaning rules should respond to actual data problems. Inspection reveals types, missingness, suspicious values and ranges before irreversible changes are made.",
      },

      {
        id: "pandas-practice-5",
        title: "Create a Feature",
        type: "coding",
        difficulty: "medium",
        question:
          "A DataFrame contains total_cost and quantity. Create unit_cost while handling quantity == 0 deliberately.",
        instructions: [
          "Do not blindly divide by zero.",
          "Choose an explicit policy for invalid rows.",
        ],
        hints: [
          "You can use a mask or NumPy where.",
        ],
        explanation:
          "The important idea is to define how zero quantity should be represented rather than allowing an unexplained infinite or invalid derived feature.",
      },
    ],

    keyTakeaways: [
      "Series and DataFrame are core Pandas structures.",
      "Inspect datasets before changing them.",
      "loc and iloc provide different selection semantics.",
      "Boolean masks filter rows.",
      "groupby summarizes subgroups.",
      "Vectorized column operations support feature creation.",
      "Pandas is a central bridge between raw tabular data and machine-learning preprocessing.",
    ],
  },
};