import {
  useSVM,
} from "../context/SVMContext";

type Mistake = {
  title: string;
  problem: string;
  fix: string;
};

export default function SVMCommonMistakes() {
  const { state } = useSVM();

  const mistakes:
    Mistake[] = [
      {
        title:
          "Skipping feature scaling",
        problem:
          "Features with very different numeric ranges can dominate distance and similarity calculations.",
        fix:
          "Standardize numeric features, especially when using RBF, polynomial or sigmoid kernels.",
      },
      {
        title:
          "Using a very large C",
        problem:
          "The model may focus too strongly on classifying training observations correctly and create a complicated boundary.",
        fix:
          "Compare multiple C values using validation or cross-validation.",
      },
      {
        title:
          "Using a very large gamma",
        problem:
          "With RBF-like kernels, each point can influence only a tiny local region, increasing boundary complexity.",
        fix:
          "Tune C and gamma together instead of tuning either parameter in isolation.",
      },
      {
        title:
          "Treating every kernel as a sklearn string",
        problem:
          "Laplacian, Chi-Square and ModelMind custom kernels are not standard SVC/SVR kernel string options.",
        fix:
          "Use a callable kernel or precomputed kernel matrix when implementing custom kernels.",
      },
      {
        title:
          "Evaluating only on training data",
        problem:
          "High training performance does not prove the model generalizes.",
        fix:
          "Use a train/test split or cross-validation and evaluate unseen observations.",
      },
    ];

  if (
    state.task ===
    "regression"
  ) {
    mistakes.push({
      title:
        "Ignoring epsilon in SVR",
      problem:
        "Epsilon determines the width of the region where prediction errors receive no epsilon-insensitive penalty.",
      fix:
        "Tune epsilon according to the scale and acceptable error of the target variable.",
    });
  }

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>
          DEBUG YOUR THINKING
        </span>

        <h3>
          Common SVM Mistakes
        </h3>
      </div>

      <div className="mistake-grid">
        {mistakes.map(
          (
            mistake,
            index
          ) => (
            <article
              key={mistake.title}
              className="mistake-card"
            >
              <span>
                Mistake{" "}
                {index + 1}
              </span>

              <h4>
                {mistake.title}
              </h4>

              <p>
                {
                  mistake.problem
                }
              </p>

              <div>
                <strong>
                  How to fix it
                </strong>

                <p>
                  {mistake.fix}
                </p>
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
}