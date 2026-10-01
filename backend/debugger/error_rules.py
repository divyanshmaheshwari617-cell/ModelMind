from typing import Final


VALID_LEVELS: Final = {
    "basic",
    "medium",
    "advanced",
}


LEVEL_ALIASES: Final = {
    "beginner": "basic",
    "basic": "basic",

    # Backward compatibility with the current ModelMind UI/API.
    "intermediate": "medium",
    "medium": "medium",

    "advanced": "advanced",
    "expert": "advanced",
}


def normalize_level(level: str | None) -> str:
    """
    Convert every supported learning-level name into ModelMind's
    canonical three levels:

        basic
        medium
        advanced
    """

    if not level:
        return "basic"

    normalized = level.strip().lower()

    return LEVEL_ALIASES.get(
        normalized,
        "basic",
    )


ERROR_RULES = {
    "SyntaxError": {
        "title": "Python syntax problem",

        "basic": (
            "Python cannot understand the way this line is written. "
            "There may be a missing bracket, quote, colon or another "
            "small syntax mistake."
        ),

        "medium": (
            "Python could not parse this statement because its syntax "
            "does not follow Python's grammar. Check brackets, quotes, "
            "colons, commas and the structure around the reported line."
        ),

        "advanced": (
            "Python's parser could not construct a valid syntax tree "
            "for this source code. Inspect the reported token and also "
            "the preceding line because an unmatched delimiter can make "
            "the parser report the problem later than where it started."
        ),
    },

    "IndentationError": {
        "title": "Indentation problem",

        "basic": (
            "Python uses spaces to understand which lines belong "
            "together. One of your lines has incorrect indentation."
        ),

        "medium": (
            "The indentation of this statement does not match the "
            "surrounding Python block. Check the spaces under functions, "
            "loops, conditions and classes."
        ),

        "advanced": (
            "Python rejected the block structure because the indentation "
            "level is inconsistent with the surrounding suite. Use a "
            "consistent indentation policy, normally four spaces per "
            "block."
        ),
    },

    "TabError": {
        "title": "Tabs and spaces are mixed",

        "basic": (
            "Some lines use tabs while others use spaces. Python can "
            "become confused when both are used for indentation."
        ),

        "medium": (
            "The file contains inconsistent indentation using tabs and "
            "spaces. Convert the affected block to one consistent style."
        ),

        "advanced": (
            "Python detected an ambiguous indentation structure caused "
            "by mixing tab and space characters. Normalize indentation "
            "to four spaces per level."
        ),
    },

    "NameError": {
        "title": "Unknown variable or name",

        "basic": (
            "Python cannot find the variable or name you are trying "
            "to use. It may be misspelled or may not have been created yet."
        ),

        "medium": (
            "The identifier is not available in the current scope. "
            "Check its spelling and make sure the cell or statement "
            "that defines it has already run."
        ),

        "advanced": (
            "Python's LEGB name-resolution process could not resolve "
            "the identifier in the local, enclosing, global or built-in "
            "namespaces. In a notebook, also verify execution order."
        ),
    },

    "UnboundLocalError": {
        "title": "Local variable used before assignment",

        "basic": (
            "Python found the variable inside the function, but you "
            "tried to use it before giving it a value."
        ),

        "medium": (
            "A local variable is referenced before assignment. Check "
            "the order of assignments and conditional branches inside "
            "the function."
        ),

        "advanced": (
            "Because the name is assigned somewhere in the function, "
            "Python treats it as local scope, but execution reached a "
            "read before a local value had been bound."
        ),
    },

    "TypeError": {
        "title": "Type mismatch",

        "basic": (
            "Python tried to use values together that do not work "
            "together, such as adding text to a number."
        ),

        "medium": (
            "An operation received an object of an incompatible type. "
            "Inspect the values and their types before converting them."
        ),

        "advanced": (
            "Python's runtime type rules rejected the operation because "
            "the operand or argument types do not satisfy the protocol "
            "expected by that operation."
        ),
    },

    "ValueError": {
        "title": "Invalid value",

        "basic": (
            "The kind of value may be correct, but the actual value "
            "cannot be used for this operation."
        ),

        "medium": (
            "The function received an argument with an acceptable type "
            "but an invalid value. Inspect the data and the constraints "
            "expected by the function."
        ),

        "advanced": (
            "The operation's type requirements were satisfied, but its "
            "semantic value constraints were violated. Inspect the "
            "library's expected domain, shape or allowed values."
        ),
    },

    "IndexError": {
        "title": "Sequence position does not exist",

        "basic": (
            "Your code tried to access a list or array position that "
            "does not exist."
        ),

        "medium": (
            "The requested sequence index is outside its valid range. "
            "Check the sequence length and remember that Python indexes "
            "normally start at zero."
        ),

        "advanced": (
            "The integer subscript exceeds the bounds of the indexed "
            "sequence. Inspect the shape or length before performing "
            "the indexing operation."
        ),
    },

    "KeyError": {
        "title": "Key or column not found",

        "basic": (
            "Python cannot find the requested key. If you are using "
            "Pandas, this may mean the column name is incorrect."
        ),

        "medium": (
            "A mapping lookup failed because the requested key does not "
            "exist. With Pandas, inspect df.columns for spelling, spaces "
            "and capitalization."
        ),

        "advanced": (
            "Mapping or DataFrame subscription attempted to resolve a "
            "label absent from the current index. Validate the schema "
            "before downstream processing."
        ),
    },

    "AttributeError": {
        "title": "Attribute or method not found",

        "basic": (
            "This object does not have the property or function you "
            "tried to use."
        ),

        "medium": (
            "Attribute lookup failed. Check the object's actual type "
            "and verify that the method or property belongs to it."
        ),

        "advanced": (
            "Python could not resolve the requested attribute through "
            "the object's normal attribute lookup mechanism. Inspect "
            "the runtime type and relevant library API."
        ),
    },

    "ZeroDivisionError": {
        "title": "Division by zero",

        "basic": (
            "Your program tried to divide a number by zero."
        ),

        "medium": (
            "The denominator evaluated to zero. Check the denominator "
            "before performing the division."
        ),

        "advanced": (
            "The divisor evaluated to zero at runtime. Determine whether "
            "zero represents invalid data, an edge case or behavior that "
            "requires explicit handling."
        ),
    },

    "ModuleNotFoundError": {
        "title": "Python package not found",

        "basic": (
            "Python cannot find the library you are trying to import. "
            "It may not be installed."
        ),

        "medium": (
            "The requested module is unavailable in the current Python "
            "environment. Check the package name and installation."
        ),

        "advanced": (
            "Python's import system could not locate the requested module "
            "on sys.path. Verify the active environment, distribution "
            "name and installed package version."
        ),
    },

    "ImportError": {
        "title": "Import failed",

        "basic": (
            "Python found the library, but it could not import the "
            "part you requested."
        ),

        "medium": (
            "The module was found, but the requested symbol or import "
            "operation failed. Check the import name and library version."
        ),

        "advanced": (
            "Module resolution succeeded, but import initialization or "
            "symbol resolution failed. Inspect package versions, circular "
            "imports and the library's public API."
        ),
    },

    "FileNotFoundError": {
        "title": "File not found",

        "basic": (
            "Python cannot find the file at the location written in "
            "your code."
        ),

        "medium": (
            "The requested file path does not point to an available "
            "file. Check the filename, path and notebook workspace."
        ),

        "advanced": (
            "The operating system could not resolve the requested "
            "filesystem entry. Inspect absolute versus relative paths "
            "and the runtime's working directory."
        ),
    },

    "NotADirectoryError": {
        "title": "Expected a folder",

        "basic": (
            "Python expected part of this path to be a folder, but it "
            "is not."
        ),

        "medium": (
            "A filesystem operation expected a directory but encountered "
            "a file or another non-directory path component."
        ),

        "advanced": (
            "Path traversal failed because a component expected to be a "
            "directory resolved to a non-directory filesystem entry."
        ),
    },

    "IsADirectoryError": {
        "title": "Expected a file",

        "basic": (
            "Your code tried to use a folder as though it were a file."
        ),

        "medium": (
            "The operation expected a file path but received a directory."
        ),

        "advanced": (
            "The filesystem operation requires a regular file, while the "
            "resolved path identifies a directory."
        ),
    },

    "OverflowError": {
        "title": "Number is too large",

        "basic": (
            "A calculation produced a number that this operation cannot "
            "handle."
        ),

        "medium": (
            "The numeric result exceeded the range supported by the "
            "operation or underlying numeric representation."
        ),

        "advanced": (
            "The computation exceeded the representable numeric range "
            "for the relevant operation or library datatype. Consider "
            "rescaling or a numerically stable formulation."
        ),
    },

    "MemoryError": {
        "title": "Not enough memory",

        "basic": (
            "Python tried to use more memory than the environment could "
            "provide."
        ),

        "medium": (
            "The operation requires more memory than is currently "
            "available. Reduce the data size or avoid unnecessary copies."
        ),

        "advanced": (
            "The allocation request could not be satisfied. Inspect "
            "dataset cardinality, array dtypes, intermediate copies and "
            "whether chunked or streaming computation is appropriate."
        ),
    },
}


def get_error_rule(
    error_type: str,
    message: str,
    level: str,
) -> dict | None:

    rule = ERROR_RULES.get(error_type)

    if not rule:
        return None

    level_key = normalize_level(level)

    return {
        "title": rule["title"],
        "explanation": rule[level_key],
        "level": level_key,
    }