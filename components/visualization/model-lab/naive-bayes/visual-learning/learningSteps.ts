export type NBLearningStep = {
  id: number;
  title: string;
  shortTitle: string;
  question: string;
  explanation: string;
  takeaway: string;
};

export const naiveBayesLearningSteps: NBLearningStep[] = [
  {
    id: 1,
    title: "Meet the Data",
    shortTitle: "Data",
    question: "What information does Naive Bayes receive?",
    explanation:
      "Each row represents one student. Study Hours, Attendance and Previous Score are the features. Result is the class that we want to predict.",
    takeaway:
      "Features are the evidence; Result is the class.",
  },
  {
    id: 2,
    title: "Understand Probability",
    shortTitle: "Probability",
    question: "How common is each outcome?",
    explanation:
      "Probability tells us how often an event occurs relative to all observations. Before looking at any student features, we can count how many students Pass and how many Fail.",
    takeaway:
      "Probability = favorable observations ÷ total observations.",
  },
  {
    id: 3,
    title: "Calculate the Prior",
    shortTitle: "Prior",
    question: "What did we believe before seeing the new student?",
    explanation:
      "The prior is the probability of each class before considering the new student's feature values. Naive Bayes learns these probabilities from the training data.",
    takeaway:
      "Prior = P(Class).",
  },
  {
    id: 4,
    title: "Conditional Probability",
    shortTitle: "Conditional",
    question: "What changes when we already know something?",
    explanation:
      "Conditional probability measures the probability of an event when another condition is already known. For example, we can ask how common high attendance is among students who passed.",
    takeaway:
      "P(A | B) means the probability of A given B.",
  },
  {
    id: 5,
    title: "Calculate Likelihoods",
    shortTitle: "Likelihood",
    question: "How well do the student's features match each class?",
    explanation:
      "A likelihood measures how compatible an observed feature value is with a particular class. Gaussian Naive Bayes models each numerical feature using a Gaussian distribution for every class.",
    takeaway:
      "Likelihood asks: how likely is this feature value if the class were known?",
  },
  {
    id: 6,
    title: "Apply Bayes' Theorem",
    shortTitle: "Bayes",
    question: "How do prior knowledge and new evidence combine?",
    explanation:
      "Bayes' theorem updates our belief about a class using evidence. Naive Bayes combines the class prior with the likelihood of the observed features.",
    takeaway:
      "Posterior ∝ Prior × Likelihood.",
  },
  {
    id: 7,
    title: "The Naive Assumption",
    shortTitle: "Naive",
    question: "Why is it called Naive Bayes?",
    explanation:
      "Naive Bayes assumes that features are conditionally independent given the class. This lets it multiply the individual feature likelihoods instead of modelling every interaction between features.",
    takeaway:
      "Naive assumption: features are independent given the class.",
  },
  {
    id: 8,
    title: "Compare Posterior Scores",
    shortTitle: "Posterior",
    question: "Which class receives stronger evidence?",
    explanation:
      "For every possible class, Naive Bayes combines the prior and feature likelihoods. The resulting class scores can be normalized into posterior probabilities.",
    takeaway:
      "Calculate one posterior score for every class.",
  },
  {
    id: 9,
    title: "Make the Prediction",
    shortTitle: "Predict",
    question: "Which class should the new observation receive?",
    explanation:
      "Naive Bayes predicts the class with the largest posterior score. The important part is that we can inspect the prior, each likelihood and the final class comparison.",
    takeaway:
      "Prediction = class with the highest posterior score.",
  },
];