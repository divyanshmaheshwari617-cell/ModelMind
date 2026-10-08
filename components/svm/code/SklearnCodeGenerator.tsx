import {
  useMemo,
  useState,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

export default function SklearnCodeGenerator() {
  const { state } = useSVM();

  const [copied, setCopied] =
    useState(false);

  const code =
    useMemo(
      () =>
        generateCode(state),
      [state]
    );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(false),
        1200
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading code-heading">
        <div>
          <span>
            GENERATED PYTHON
          </span>

          <h3>
            scikit-learn Code
          </h3>

          <p>
            This code uses your current
            task, kernel, C, gamma,
            degree, coef0, epsilon and
            scaling configuration.
          </p>
        </div>

        <button
          className="knowledge-action"
          onClick={copyCode}
        >
          {copied
            ? "Copied"
            : "Copy Code"}
        </button>
      </div>

      <pre className="sklearn-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function generateCode(
  state: ReturnType<
    typeof useSVM
  >["state"]
) {
  const {
    parameters,
    task,
    dataset,
  } = state;

  const nativeKernel =
    parameters.kernel ===
      "polynomial"
      ? "poly"
      : parameters.kernel;

  const supported =
    [
      "linear",
      "poly",
      "rbf",
      "sigmoid",
    ].includes(nativeKernel);

  if (!supported) {
    return `# ${parameters.kernel} is shown in ModelMind as an
# educational/custom kernel.
#
# scikit-learn SVC/SVR does not accept
# "${parameters.kernel}" as a built-in kernel string.
#
# Implement a callable kernel or compute a
# precomputed Gram matrix before training.

from sklearn.svm import ${
      task ===
      "classification"
        ? "SVC"
        : "SVR"
    }

# Current ModelMind parameters:
C = ${parameters.C}
gamma = ${parameters.gamma}
degree = ${parameters.degree}
coef0 = ${parameters.coef0}
${
  task === "regression"
    ? `epsilon = ${parameters.epsilon}`
    : ""
}`;
  }

  const model =
    task ===
    "classification"
      ? `SVC(
    C=${parameters.C},
    kernel="${nativeKernel}",
    gamma=${parameters.gamma},
    degree=${parameters.degree},
    coef0=${parameters.coef0},
    class_weight=${
      parameters.classWeight ===
      "balanced"
        ? '"balanced"'
        : "None"
    }
)`
      : `SVR(
    C=${parameters.C},
    kernel="${nativeKernel}",
    gamma=${parameters.gamma},
    degree=${parameters.degree},
    coef0=${parameters.coef0},
    epsilon=${parameters.epsilon}
)`;

  const scaling =
    dataset?.scalingEnabled ??
    false;

  return `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.svm import ${
    task ===
    "classification"
      ? "SVC"
      : "SVR"
  }
${
  scaling
    ? "from sklearn.preprocessing import StandardScaler"
    : ""
}
from sklearn.metrics import ${
    task ===
    "classification"
      ? "accuracy_score, classification_report, confusion_matrix"
      : "mean_absolute_error, mean_squared_error, r2_score"
  }

# Load your dataset
df = pd.read_csv("your_dataset.csv")

feature_columns = ${JSON.stringify(
    dataset?.featureColumns ??
      [
        "feature_1",
        "feature_2",
      ]
  )}

target_column = ${JSON.stringify(
    dataset?.targetColumn ??
      "target"
  )}

X = df[feature_columns]
y = df[target_column]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42${
      task ===
      "classification"
        ? ",\n    stratify=y"
        : ""
    }
)

${
  scaling
    ? `scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

`
    : ""
}model = ${model}

model.fit(X_train, y_train)

predictions = model.predict(X_test)

${
  task ===
  "classification"
    ? `print("Accuracy:", accuracy_score(y_test, predictions))
print("\\nClassification Report:")
print(classification_report(y_test, predictions))

print("\\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

print("\\nSupport vectors per class:")
print(model.n_support_)`
    : `mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
rmse = mse ** 0.5
r2 = r2_score(y_test, predictions)

print("MAE:", mae)
print("MSE:", mse)
print("RMSE:", rmse)
print("R2:", r2)

print("Support vector count:", len(model.support_))`
}`;
}
