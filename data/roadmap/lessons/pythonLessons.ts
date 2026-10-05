import type {
  LessonContent,
} from "../../../types/roadmap";


export const pythonLessons: LessonContent[] = [
  {
    id: "lesson-python-basics",

    skillId: "python-basics",

    title: "Python Fundamentals",

    subtitle:
      "Build the Python foundation required for data science and machine learning.",

    overview:
      "Python is the main programming language used throughout the ModelMind learning path. In this lesson you will learn how Python programs are written and executed, how values are stored using variables, how different data types behave, how programs receive input and produce output, how operators create expressions, and how conditions allow programs to make decisions.",

    objectives: [
      "Understand how a basic Python program works",
      "Write and execute Python statements",
      "Create and use variables",
      "Understand important built-in data types",
      "Convert values between compatible data types",
      "Accept input from a user",
      "Display formatted output",
      "Use arithmetic, comparison and logical operators",
      "Write conditional statements",
      "Trace simple Python programs",
      "Recognize common beginner mistakes",
      "Solve basic Python programming problems",
    ],

    prerequisites: [],

    sections: [
      {
        id: "python-introduction",

        title: "What is Python?",

        explanation: [
          "Python is a high-level programming language designed to make programs relatively easy to read and write.",

          "Instead of directly controlling computer hardware, you write human-readable instructions and the Python runtime executes those instructions.",

          "Python is widely used in data analysis, machine learning, artificial intelligence, automation, backend development and scientific computing.",

          "For machine learning, Python is especially useful because libraries such as NumPy, Pandas, Matplotlib, Seaborn and scikit-learn provide ready-to-use tools for working with data and building models.",

          "Learning the language itself is important before learning those libraries. Libraries still use ordinary Python concepts such as variables, functions, lists, conditions and objects.",
        ],

        intuition: [
          "Think of Python as the language you use to give instructions to the computer.",

          "A machine-learning library gives you powerful tools, but Python is the language you use to control those tools.",
        ],

        importantPoints: [
          "Python code is case-sensitive.",
          "Indentation has meaning in Python.",
          "Python programs execute statements in an ordered flow unless control-flow statements change that flow.",
          "Python will be the programming foundation for later ModelMind ML lessons.",
        ],

        examples: [
          {
            id: "first-python-program",

            title: "Your first Python statement",

            explanation:
              "The print function displays information on the screen.",

            code: `print("Hello, ModelMind!")`,

            language: "python",

            output: "Hello, ModelMind!",

            importantPoints: [
              "print() is a built-in Python function.",
              "Text is written inside quotes.",
              "The value inside print() is sent to the output.",
            ],
          },
        ],
      },

      {
        id: "python-syntax",

        title: "Python Syntax and Indentation",

        explanation: [
          "Syntax means the rules that determine how valid Python code must be written.",

          "Python uses indentation to represent blocks of code. This is different from languages such as C++ and Java, where braces are commonly used for blocks.",

          "Statements belonging to an if statement, loop, function or other block must be indented consistently.",

          "Incorrect indentation can change the meaning of a program or cause an IndentationError.",
        ],

        intuition: [
          "Indentation visually tells Python which instructions belong together.",
        ],

        examples: [
          {
            id: "python-indentation-example",

            title: "Indentation",

            explanation:
              "The indented print statement belongs to the if block.",

            code: `age = 20

if age >= 18:
    print("Adult")

print("Program finished")`,

            language: "python",

            output: `Adult
Program finished`,
          },
        ],
      },

      {
        id: "python-variables",

        title: "Variables",

        explanation: [
          "A variable is a name that refers to a value in a program.",

          "Variables allow us to store information and use it later instead of repeatedly writing the same value.",

          "Python does not require you to declare the type of a variable before assigning a value.",

          "The assignment operator = assigns the value on the right side to the variable name on the left side.",

          "A variable can later be assigned another value.",
        ],

        intuition: [
          "Think of a variable as a meaningful label attached to a value.",

          "Instead of remembering that 92 represents a student's score, we can store it in a variable called score.",
        ],

        importantPoints: [
          "Variable names should describe what the value represents.",
          "Variable names cannot begin with a digit.",
          "Python variable names are case-sensitive.",
          "score and Score are different names.",
          "= means assignment, not mathematical equality.",
        ],

        examples: [
          {
            id: "variable-example",

            title: "Creating variables",

            explanation:
              "Different values are stored using meaningful variable names.",

            code: `student_name = "Aman"
age = 19
score = 92.5
passed = True

print(student_name)
print(score)`,

            language: "python",

            output: `Aman
92.5`,
          },

          {
            id: "variable-update",

            title: "Updating a variable",

            explanation:
              "The value associated with a variable can change during program execution.",

            code: `score = 70
print(score)

score = 85
print(score)`,

            language: "python",

            output: `70
85`,
          },
        ],
      },

      {
        id: "python-data-types",

        title: "Basic Data Types",

        explanation: [
          "A data type describes the kind of value being stored and determines which operations make sense for that value.",

          "The int type represents whole numbers such as 10, -5 and 100.",

          "The float type represents numbers containing a decimal component such as 3.14 and 92.5.",

          "The str type represents textual data.",

          "The bool type represents the logical values True and False.",

          "Python provides the type() function when you want to inspect the type of a value.",
        ],

        importantPoints: [
          "int stores integer values.",
          "float stores floating-point values.",
          "str stores text.",
          "bool stores True or False.",
          "type() can be used to inspect a value's type.",
        ],

        examples: [
          {
            id: "data-type-example",

            title: "Inspecting data types",

            explanation:
              "type() shows the type associated with each value.",

            code: `age = 20
accuracy = 0.94
model = "Logistic Regression"
trained = True

print(type(age))
print(type(accuracy))
print(type(model))
print(type(trained))`,

            language: "python",
          },
        ],
      },

      {
        id: "python-type-conversion",

        title: "Type Conversion",

        explanation: [
          "Type conversion means converting a value from one compatible data type to another.",

          "int() can convert suitable values to integers.",

          "float() converts suitable values to floating-point numbers.",

          "str() creates a string representation of a value.",

          "Type conversion is especially important when receiving user input because input() returns text.",
        ],

        examples: [
          {
            id: "conversion-example",

            title: "Converting text to an integer",

            explanation:
              "The string value is converted into an integer before arithmetic is performed.",

            code: `age_text = "20"
age = int(age_text)

print(age + 1)`,

            language: "python",

            output: "21",
          },
        ],
      },

      {
        id: "python-input-output",

        title: "Input and Output",

        explanation: [
          "Programs frequently need to receive information and return results.",

          "The input() function reads user input.",

          "The value returned by input() is a string unless you explicitly convert it.",

          "The print() function displays values.",

          "Formatted strings, commonly called f-strings, allow variables and expressions to be inserted directly into text.",
        ],

        importantPoints: [
          "input() returns a string.",
          "Convert numerical input before numerical calculations.",
          "f-strings make formatted output easier to read.",
        ],

        examples: [
          {
            id: "input-example",

            title: "Reading numerical input",

            explanation:
              "The user's text input is converted to an integer.",

            code: `age = int(input("Enter your age: "))

print(f"Next year you will be {age + 1}")`,

            language: "python",
          },
        ],
      },

      {
        id: "python-arithmetic",

        title: "Arithmetic Operators",

        explanation: [
          "Arithmetic operators perform mathematical operations on numerical values.",

          "Python supports addition, subtraction, multiplication, division, floor division, remainder and exponentiation.",
        ],

        importantPoints: [
          "+ performs addition.",
          "- performs subtraction.",
          "* performs multiplication.",
          "/ performs division.",
          "// performs floor division.",
          "% returns the remainder.",
          "** performs exponentiation.",
        ],

        examples: [
          {
            id: "arithmetic-example",

            title: "Arithmetic operations",

            explanation:
              "The same two values can participate in several different arithmetic operations.",

            code: `a = 10
b = 3

print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a // b)
print(a % b)
print(a ** b)`,

            language: "python",
          },
        ],
      },

      {
        id: "python-comparison",

        title: "Comparison Operators",

        explanation: [
          "Comparison operators compare values.",

          "The result of a comparison is a Boolean value: True or False.",

          "Comparisons are heavily used in conditions, filtering and later data-analysis operations.",
        ],

        importantPoints: [
          "== checks equality.",
          "!= checks inequality.",
          "> checks greater than.",
          "< checks less than.",
          ">= checks greater than or equal to.",
          "<= checks less than or equal to.",
        ],

        examples: [
          {
            id: "comparison-example",

            title: "Comparing a score",

            explanation:
              "The comparison produces a Boolean result.",

            code: `score = 82

print(score >= 40)
print(score == 100)
print(score < 40)`,

            language: "python",

            output: `True
False
False`,
          },
        ],
      },

      {
        id: "python-logical",

        title: "Logical Operators",

        explanation: [
          "Logical operators combine or modify Boolean conditions.",

          "and is True when both conditions are True.",

          "or is True when at least one condition is True.",

          "not reverses a Boolean condition.",
        ],

        examples: [
          {
            id: "logical-example",

            title: "Combining conditions",

            explanation:
              "Both conditions must be true for the complete and expression to evaluate to True.",

            code: `age = 20
has_id = True

print(age >= 18 and has_id)`,

            language: "python",

            output: "True",
          },
        ],
      },

      {
        id: "python-conditionals",

        title: "Conditional Statements",

        explanation: [
          "Conditional statements allow a program to choose which code should execute.",

          "if checks the first condition.",

          "elif allows additional conditions to be checked when earlier conditions are false.",

          "else handles the remaining case when none of the preceding conditions are true.",
        ],

        intuition: [
          "A condition acts like a decision point in a flowchart.",

          "The program evaluates a question and follows the branch corresponding to the result.",
        ],

        importantPoints: [
          "Conditions evaluate to True or False.",
          "Indentation determines which statements belong to each branch.",
          "Only the appropriate branch in an if/elif/else chain executes.",
        ],

        examples: [
          {
            id: "grade-example",

            title: "Student grade",

            explanation:
              "The program chooses a grade based on the student's score.",

            code: `score = 78

if score >= 90:
    print("Grade A")
elif score >= 75:
    print("Grade B")
elif score >= 60:
    print("Grade C")
else:
    print("Needs improvement")`,

            language: "python",

            output: "Grade B",
          },
        ],
      },
    ],

    visualization: {
      type: "native",

      visualizationId:
        "python-program-flow",

      title:
        "Python Program Flow",

      description:
        "Interactively follow variables, expressions and conditional branches as a small Python program executes.",
    },

    codeExamples: [
      {
        id: "python-student-result",

        title:
          "Student Result Program",

        description:
          "Combine input, variables, arithmetic, comparison and conditions in one program.",

        language: "python",

        code: `name = input("Enter student name: ")
marks = float(input("Enter marks: "))

if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 60:
    grade = "C"
elif marks >= 40:
    grade = "D"
else:
    grade = "F"

passed = marks >= 40

print(f"Student: {name}")
print(f"Marks: {marks}")
print(f"Grade: {grade}")
print(f"Passed: {passed}")`,

        explanation: [
          "The program first reads the student's name and marks.",
          "float() converts the marks from text into a numerical value.",
          "The if/elif/else chain determines the grade.",
          "The comparison marks >= 40 produces a Boolean value.",
          "f-strings insert variable values into readable output.",
        ],

        commonMistakes: [
          "Forgetting to convert marks returned by input().",
          "Using = instead of == when checking equality.",
          "Incorrect indentation inside the conditional branches.",
        ],
      },
    ],

    practice: [
      {
        id: "python-practice-1",

        title: "Predict the output",

        type: "output",

        difficulty: "basic",

        question:
          "What will the following program print?",

        starterCode: `x = 10
y = 4

print(x + y)
print(x % y)`,

        hints: [
          "The % operator returns the remainder.",
        ],

        solution: `14
2`,

        explanation:
          "10 + 4 is 14, while dividing 10 by 4 leaves a remainder of 2.",
      },

      {
        id: "python-practice-2",

        title:
          "Positive, negative or zero",

        type: "coding",

        difficulty: "basic",

        question:
          "Write a program that reads a number and prints whether it is positive, negative or zero.",

        instructions: [
          "Read one numerical value.",
          "Use if, elif and else.",
          "Print exactly one classification.",
        ],

        hints: [
          "First compare the number with 0.",
          "You need three possible branches.",
        ],

        solution: `number = float(input("Enter a number: "))

if number > 0:
    print("Positive")
elif number < 0:
    print("Negative")
else:
    print("Zero")`,
      },

      {
        id: "python-practice-3",

        title:
          "Debug the age checker",

        type: "debugging",

        difficulty: "medium",

        question:
          "The following program does not work correctly. Find and fix the problems.",

        starterCode: `age = input("Enter age: ")

if age >= 18
print("Adult")
else:
    print("Minor")`,

        hints: [
          "What type does input() return?",
          "Check the syntax of the if statement.",
          "Check indentation.",
        ],

        solution: `age = int(input("Enter age: "))

if age >= 18:
    print("Adult")
else:
    print("Minor")`,

        explanation:
          "The input must be converted to an integer, the if condition requires a colon, and the statement belonging to the if block must be indented.",
      },

      {
        id: "python-practice-4",

        title:
          "Simple eligibility system",

        type: "coding",

        difficulty: "medium",

        question:
          "Create a program that checks whether a student is eligible for an exam. The student must have attendance of at least 75 and must have submitted the required assignment.",

        instructions: [
          "Create an attendance variable.",
          "Create a Boolean variable representing assignment submission.",
          "Use a logical operator.",
          "Print Eligible or Not eligible.",
        ],

        hints: [
          "Both conditions must be true.",
          "Think about whether and or or is appropriate.",
        ],

        solution: `attendance = 82
assignment_submitted = True

if attendance >= 75 and assignment_submitted:
    print("Eligible")
else:
    print("Not eligible")`,
      },

      {
        id: "python-practice-5",

        title:
          "Build a simple prediction rule",

        type: "analysis",

        difficulty: "advanced",

        question:
          "Imagine a very simple rule-based system predicts that a customer may leave when their satisfaction score is below 4 and their number of complaints is greater than 2. Implement this rule and explain why this is a decision rule rather than a trained machine-learning model.",

        hints: [
          "Combine two comparisons.",
          "Both conditions must be true.",
          "Ask who created the decision rule: a programmer or a learning algorithm?",
        ],

        solution: `satisfaction = 3
complaints = 4

if satisfaction < 4 and complaints > 2:
    print("High churn risk")
else:
    print("Low churn risk")`,

        explanation:
          "The programmer manually defined the decision boundary. A trained machine-learning model instead learns patterns or parameters from training data.",
      },
    ],

    commonMistakes: [
      {
        id: "python-mistake-assignment-equality",

        title:
          "Confusing = and ==",

        description:
          "= assigns a value, while == compares two values.",

        correction:
          "Use = when storing a value and == when testing whether two values are equal.",
      },

      {
        id: "python-mistake-input-string",

        title:
          "Forgetting that input returns text",

        description:
          "input() returns a string even when the user types digits.",

        correction:
          "Convert numerical input using int() or float() before performing numerical operations.",
      },

      {
        id: "python-mistake-indentation",

        title:
          "Incorrect indentation",

        description:
          "Python uses indentation to determine which statements belong to a block.",

        correction:
          "Indent statements consistently inside if, elif and else blocks.",
      },

      {
        id: "python-mistake-condition-order",

        title:
          "Incorrect condition ordering",

        description:
          "An earlier broad condition can prevent a later condition from ever being reached.",

        correction:
          "When checking thresholds, reason carefully about the order in which conditions should be evaluated.",
      },
    ],

    keyTakeaways: [
      "Python is the programming foundation used throughout ModelMind.",
      "Variables associate meaningful names with values.",
      "Data types determine how values behave.",
      "input() returns text unless the value is converted.",
      "Operators create calculations and Boolean expressions.",
      "if, elif and else allow programs to make decisions.",
      "Indentation is part of Python syntax.",
      "Understanding program flow is essential before moving to data structures, functions and ML libraries.",
    ],

    nextTopics: [
      "python-data-structures",
      "python-functions",
    ],
  },
];