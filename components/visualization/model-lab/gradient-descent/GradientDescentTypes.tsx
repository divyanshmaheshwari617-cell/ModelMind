"use client";

export type GradientDescentType =
  | "Batch Gradient Descent"
  | "Stochastic Gradient Descent"
  | "Mini-Batch Gradient Descent";

type GradientDescentTypesProps = {
  selectedType: GradientDescentType;

  onTypeChange: (
    type: GradientDescentType
  ) => void;

  totalSamples: number;

  batchSize: number;

  activeIndexes?: number[];
};

type GradientDescentTypeInfo = {
  id: GradientDescentType;

  shortName: string;

  description: string;

  samplesUsed: string;

  pathBehavior: string;

  advantage: string;

  limitation: string;
};

const gradientTypes: GradientDescentTypeInfo[] =
  [
    {
      id: "Batch Gradient Descent",

      shortName: "Batch GD",

      description:
        "Batch Gradient Descent uses the entire training dataset to calculate one gradient update.",

      samplesUsed:
        "All training samples are used before weight and bias are updated.",

      pathBehavior:
        "The optimization path is usually smooth and stable because every update uses the complete dataset.",

      advantage:
        "Provides a stable and accurate gradient direction.",

      limitation:
        "Each update can become computationally expensive when the dataset is very large.",
    },

    {
      id: "Stochastic Gradient Descent",

      shortName: "SGD",

      description:
        "Stochastic Gradient Descent uses only one training sample for each parameter update.",

      samplesUsed:
        "Exactly one training example contributes to each gradient calculation.",

      pathBehavior:
        "The optimization path is usually noisy because every sample can push the parameters in a slightly different direction.",

      advantage:
        "Updates happen very frequently and can work well with very large datasets.",

      limitation:
        "The noisy updates can cause the optimizer to bounce around the minimum.",
    },

    {
      id: "Mini-Batch Gradient Descent",

      shortName: "Mini-Batch",

      description:
        "Mini-Batch Gradient Descent uses a small group of training samples for every update.",

      samplesUsed:
        "A subset of the dataset contributes to each gradient calculation.",

      pathBehavior:
        "Its optimization path is usually less noisy than SGD while still making updates more frequently than Batch Gradient Descent.",

      advantage:
        "Provides a useful balance between computational efficiency and gradient stability.",

      limitation:
        "The batch size becomes another parameter that must be selected.",
    },
  ];

export default function GradientDescentTypes({
  selectedType,
  onTypeChange,
  totalSamples,
  batchSize,
  activeIndexes = [],
}: GradientDescentTypesProps) {
  const selectedInfo =
    gradientTypes.find(
      (type) =>
        type.id === selectedType
    ) ?? gradientTypes[0];

  const samplesPerUpdate =
    getSamplesPerUpdate(
      selectedType,
      totalSamples,
      batchSize
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {/* HEADER */}

      <div className="border-b border-zinc-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Optimization Method
        </p>

        <h3 className="mt-2 text-lg font-semibold text-zinc-100">
          Types of Gradient Descent
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Compare how changing the
          number of samples used in
          each update changes the
          behavior of Gradient
          Descent.
        </p>
      </div>

      {/* TYPE BUTTONS */}

      <div className="grid gap-3 p-5 lg:grid-cols-3">
        {gradientTypes.map(
          (type) => {
            const active =
              selectedType ===
              type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  onTypeChange(
                    type.id
                  )
                }
                className={[
                  "rounded-xl border p-4 text-left transition",
                  active
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-zinc-100">
                    {type.shortName}
                  </span>

                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      active
                        ? "bg-emerald-400"
                        : "bg-zinc-700",
                    ].join(" ")}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {type.description}
                </p>
              </button>
            );
          }
        )}
      </div>

      {/* SELECTED TYPE */}

      <div className="border-t border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Selected Method
            </p>

            <h4 className="mt-2 text-lg font-semibold text-zinc-100">
              {selectedInfo.id}
            </h4>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-right">
            <p className="text-xs text-zinc-500">
              Samples / Update
            </p>

            <p className="mt-1 font-mono text-lg font-semibold text-zinc-100">
              {samplesPerUpdate}
            </p>
          </div>
        </div>

        {/* SAMPLE VISUALIZATION */}

        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Samples used in the
                current update
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Highlighted samples
                contribute to the
                current gradient.
              </p>
            </div>

            <span className="font-mono text-xs text-zinc-500">
              {
                activeIndexes.length
              }{" "}
              / {totalSamples} active
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {Array.from(
              {
                length:
                  totalSamples,
              },
              (_, index) => {
                const active =
                  activeIndexes.includes(
                    index
                  );

                return (
                  <div
                    key={index}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition-all duration-200",
                      active
                        ? "scale-110 border-amber-400 bg-amber-400/10 text-amber-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-600",
                    ].join(" ")}
                    title={`Sample ${
                      index + 1
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* HOW IT WORKS */}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <InfoCard
            title="How are samples used?"
            description={
              selectedInfo.samplesUsed
            }
          />

          <InfoCard
            title="Optimization Path"
            description={
              selectedInfo.pathBehavior
            }
          />

          <InfoCard
            title="Advantage"
            description={
              selectedInfo.advantage
            }
          />

          <InfoCard
            title="Limitation"
            description={
              selectedInfo.limitation
            }
          />
        </div>

        {/* FLOW */}

        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Current Update Flow
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <FlowBox>
              Select{" "}
              {samplesPerUpdate}{" "}
              sample
              {samplesPerUpdate ===
              1
                ? ""
                : "s"}
            </FlowBox>

            <Arrow />

            <FlowBox>
              Make predictions
            </FlowBox>

            <Arrow />

            <FlowBox>
              Calculate loss
            </FlowBox>

            <Arrow />

            <FlowBox>
              Calculate gradient
            </FlowBox>

            <Arrow />

            <FlowBox>
              Update w &amp; b
            </FlowBox>
          </div>
        </div>

        {/* IMPORTANT EXPLANATION */}

        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-sm font-semibold text-zinc-100">
            What should I watch in
            the animation?
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {selectedType ===
              "Batch Gradient Descent" &&
              "All data points should become active together. One update is calculated from the complete dataset, so the loss path should generally look smoother."}

            {selectedType ===
              "Stochastic Gradient Descent" &&
              "Only one data point should become active for each update. Watch how individual samples push the regression line in different directions, creating a noisier optimization path."}

            {selectedType ===
              "Mini-Batch Gradient Descent" &&
              "A small group of data points should become active together. Watch how this produces updates that are usually less noisy than SGD but more frequent than full Batch Gradient Descent."}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
========================================================
SAMPLES PER UPDATE
========================================================
*/

function getSamplesPerUpdate(
  type: GradientDescentType,
  totalSamples: number,
  batchSize: number
) {
  if (
    type ===
    "Batch Gradient Descent"
  ) {
    return totalSamples;
  }

  if (
    type ===
    "Stochastic Gradient Descent"
  ) {
    return 1;
  }

  return Math.min(
    Math.max(
      1,
      batchSize
    ),
    totalSamples
  );
}

/*
========================================================
INFO CARD
========================================================
*/

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-sm font-semibold text-zinc-200">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/*
========================================================
FLOW COMPONENTS
========================================================
*/

function FlowBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-zinc-600">
      →
    </span>
  );
}