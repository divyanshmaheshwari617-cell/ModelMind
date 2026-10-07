export default function NaiveBayesLearningDashboard() {
  const concepts = [
    {
      number: "01",
      title: "Prior",
      text:
        "How likely was each class before seeing the new observation?",
    },
    {
      number: "02",
      title: "Likelihood",
      text:
        "How compatible is the observed feature value with each class?",
    },
    {
      number: "03",
      title: "Naive assumption",
      text:
        "Feature likelihoods are combined under a conditional-independence assumption.",
    },
    {
      number: "04",
      title: "Posterior score",
      text:
        "Prior and likelihood evidence are combined for each class.",
    },
    {
      number: "05",
      title: "Prediction",
      text:
        "The class with the strongest posterior evidence becomes the prediction.",
    },
    {
      number: "06",
      title: "Model variant",
      text:
        "Gaussian, Multinomial and Bernoulli differ mainly in how feature likelihoods are modeled.",
    },
  ];

  return (
    <section style={card}>
      <div style={eyebrow}>
        LEARNING DASHBOARD
      </div>

      <h2 style={title}>
        What should you understand
        after this lab?
      </h2>

      <div style={grid}>
        {concepts.map(
          (concept) => (
            <div
              key={
                concept.number
              }
              style={
                conceptCard
              }
            >
              <div
                style={
                  number
                }
              >
                {
                  concept.number
                }
              </div>

              <strong
                style={
                  conceptTitle
                }
              >
                {
                  concept.title
                }
              </strong>

              <p
                style={
                  conceptText
                }
              >
                {
                  concept.text
                }
              </p>
            </div>
          )
        )}
      </div>

      <div style={finalBox}>
        <strong>
          Final mental model
        </strong>

        <div style={finalFlow}>
          Data → Classes → Priors
          → Feature Likelihoods →
          Posterior Evidence →
          Predicted Class
        </div>

        <p style={finalText}>
          Choosing the correct
          Naive Bayes variant is
          not about picking the
          most advanced model. It
          is about matching the
          likelihood assumption to
          the representation of
          your features.
        </p>
      </div>
    </section>
  );
}

const card = {
  padding: 20,
  borderRadius: 17,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#34d399",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = {
  margin: "6px 0 14px",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const conceptCard = {
  padding: 14,
  borderRadius: 11,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const number = {
  color: "#475569",
  fontSize: 10,
  fontWeight: 900,
};

const conceptTitle = {
  display: "block",
  marginTop: 6,
  color: "#f8fafc",
};

const conceptText = {
  marginBottom: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
  fontSize: 12,
};

const finalBox = {
  marginTop: 15,
  padding: 15,
  borderRadius: 12,
  background: "#052e16",
  border:
    "1px solid #166534",
  color: "#dcfce7",
};

const finalFlow = {
  marginTop: 8,
  color: "#86efac",
  fontFamily: "monospace",
  fontWeight: 800,
  lineHeight: 1.7,
};

const finalText = {
  color: "#bbf7d0",
  lineHeight: 1.6,
  marginBottom: 0,
};