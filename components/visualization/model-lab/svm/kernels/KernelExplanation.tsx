import type {
  SVMKernel,
} from "../types/svm";

type Props = {
  kernel: SVMKernel;
  gamma: number;
  degree: number;
};

export default function KernelExplanation({
  kernel,
  gamma,
  degree,
}: Props) {
  return (
    <section
      style={{
        border:
          "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        background:
          "#0f172a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        Kernel Intuition
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        A kernel measures
        similarity between
        observations. It allows
        SVM to create nonlinear
        decision boundaries
        without explicitly
        constructing every
        transformed feature.
      </p>

      <KernelCard
        active={
          kernel ===
          "linear"
        }
        title="Linear Kernel"
        formula="K(x,z) = xᵀz"
        description="Best starting point when classes can be separated approximately by a straight line or hyperplane."
      />

      <KernelCard
        active={
          kernel ===
          "rbf"
        }
        title="RBF Kernel"
        formula={`K(x,z) = exp(-${gamma.toFixed(
          3
        )} ||x-z||²)`}
        description="Creates flexible nonlinear boundaries by measuring local similarity."
      />

      <KernelCard
        active={
          kernel ===
          "polynomial"
        }
        title="Polynomial Kernel"
        formula={`K(x,z) = (γxᵀz + r)^${degree}`}
        description="Models curved interactions whose complexity increases with polynomial degree."
      />

      <div
        style={{
          marginTop: 18,
          padding: 14,
          background:
            "#020617",
          borderRadius: 12,
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          Kernel trick:
        </strong>{" "}
        SVM can compute inner
        products in an implicit
        higher-dimensional feature
        space through the kernel
        function, avoiding the
        need to explicitly build
        every transformed
        coordinate.
      </div>
    </section>
  );
}

function KernelCard({
  active,
  title,
  formula,
  description,
}: {
  active: boolean;
  title: string;
  formula: string;
  description: string;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        background:
          active
            ? "#172554"
            : "#020617",
        border:
          active
            ? "1px solid #60a5fa"
            : "1px solid #1e293b",
      }}
    >
      <strong>
        {title}
      </strong>

      <div
        style={{
          marginTop: 7,
          fontFamily:
            "monospace",
          color:
            "#cbd5e1",
        }}
      >
        {formula}
      </div>

      <p
        style={{
          color:
            "#94a3b8",
          marginBottom: 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </div>
  );
}