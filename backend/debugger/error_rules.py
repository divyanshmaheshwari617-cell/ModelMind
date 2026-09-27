def get_error_rule(
    error_type: str,
    message: str,
    level: str,
) -> dict | None:

    rules = {
        "TypeError": {
            "title": "Type mismatch",
            "basic": (
                "Python tried to perform an operation "
                "using values whose types do not work "
                "together."
            ),
            "intermediate": (
                "A TypeError occurs when an operation "
                "receives an object of an incompatible "
                "type."
            ),
            "advanced": (
                "Python's runtime type rules rejected "
                "the operation because the operand or "
                "argument types do not satisfy the "
                "operation's expected protocol."
            ),
        },

        "NameError": {
            "title": "Unknown variable or name",
            "basic": (
                "Python cannot find the variable or "
                "name you are trying to use."
            ),
            "intermediate": (
                "The identifier is not available in "
                "the current scope."
            ),
            "advanced": (
                "Python's name-resolution process could "
                "not resolve the identifier in the "
                "local, enclosing, global or built-in "
                "namespaces."
            ),
        },

        "ValueError": {
            "title": "Invalid value",
            "basic": (
                "The type of the value may be correct, "
                "but the actual value is not acceptable "
                "for this operation."
            ),
            "intermediate": (
                "The function received an argument with "
                "an acceptable type but an invalid value."
            ),
            "advanced": (
                "The operation's type requirements were "
                "satisfied, but its semantic value "
                "constraints were violated."
            ),
        },

        "IndexError": {
            "title": "List index out of range",
            "basic": (
                "Your code tried to access a position "
                "that does not exist in a sequence."
            ),
            "intermediate": (
                "The requested sequence index is outside "
                "its valid index range."
            ),
            "advanced": (
                "The integer subscript exceeds the "
                "bounds of the indexed sequence."
            ),
        },

        "KeyError": {
            "title": "Dictionary key not found",
            "basic": (
                "Your code asked for a dictionary key "
                "that is not present."
            ),
            "intermediate": (
                "Dictionary lookup failed because the "
                "requested key does not exist."
            ),
            "advanced": (
                "Mapping subscription attempted to "
                "resolve a key absent from the mapping."
            ),
        },

        "AttributeError": {
            "title": "Attribute or method not found",
            "basic": (
                "The object does not have the property "
                "or method your code tried to use."
            ),
            "intermediate": (
                "Attribute lookup failed for this "
                "object."
            ),
            "advanced": (
                "Python could not resolve the requested "
                "attribute through the object's normal "
                "attribute lookup mechanism."
            ),
        },

        "ZeroDivisionError": {
            "title": "Division by zero",
            "basic": (
                "Your program tried to divide a number "
                "by zero."
            ),
            "intermediate": (
                "The denominator evaluated to zero, "
                "which makes this arithmetic operation "
                "invalid."
            ),
            "advanced": (
                "Python raised ZeroDivisionError because "
                "the divisor evaluated to zero."
            ),
        },

        "ModuleNotFoundError": {
            "title": "Python package not found",
            "basic": (
                "Python cannot find the library you "
                "are trying to import."
            ),
            "intermediate": (
                "The requested module is unavailable "
                "in the current Python environment."
            ),
            "advanced": (
                "Python's import system could not locate "
                "a module matching the requested name "
                "on its import path."
            ),
        },

        "FileNotFoundError": {
            "title": "File not found",
            "basic": (
                "Python cannot find the file at the "
                "location given in your code."
            ),
            "intermediate": (
                "The requested filesystem path does "
                "not point to an available file."
            ),
            "advanced": (
                "The operating system reported that "
                "the requested filesystem entry does "
                "not exist."
            ),
        },
    }

    rule = rules.get(error_type)

    if not rule:
        return None

    level_key = level.lower()

    if level_key not in {
        "basic",
        "intermediate",
        "advanced",
    }:
        level_key = "basic"

    return {
        "title": rule["title"],
        "explanation": rule[level_key],
    }