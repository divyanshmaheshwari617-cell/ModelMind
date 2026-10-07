import type {
  NBRow,
  NaiveBayesVariant,
} from "../types/naiveBayes";

export type DefaultNBDataset = {
  name: string;
  description: string;
  variant: NaiveBayesVariant;
  rows: NBRow[];
  features: string[];
  targetName: string;
};

export const gaussianStudentDataset: DefaultNBDataset = {
  name: "Student Performance",
  description:
    "Continuous numerical features used to predict whether a student passes or fails.",
  variant: "gaussian",

  features: [
    "Study Hours",
    "Attendance",
    "Previous Score",
  ],

  targetName: "Result",

  rows: [
    {
      id: 1,
      features: {
        "Study Hours": 1.5,
        Attendance: 48,
        "Previous Score": 42,
      },
      target: "Fail",
    },
    {
      id: 2,
      features: {
        "Study Hours": 2,
        Attendance: 55,
        "Previous Score": 46,
      },
      target: "Fail",
    },
    {
      id: 3,
      features: {
        "Study Hours": 2.5,
        Attendance: 58,
        "Previous Score": 50,
      },
      target: "Fail",
    },
    {
      id: 4,
      features: {
        "Study Hours": 3,
        Attendance: 62,
        "Previous Score": 53,
      },
      target: "Fail",
    },
    {
      id: 5,
      features: {
        "Study Hours": 3.5,
        Attendance: 65,
        "Previous Score": 56,
      },
      target: "Fail",
    },
    {
      id: 6,
      features: {
        "Study Hours": 4.2,
        Attendance: 70,
        "Previous Score": 61,
      },
      target: "Pass",
    },
    {
      id: 7,
      features: {
        "Study Hours": 5,
        Attendance: 76,
        "Previous Score": 67,
      },
      target: "Pass",
    },
    {
      id: 8,
      features: {
        "Study Hours": 5.5,
        Attendance: 80,
        "Previous Score": 71,
      },
      target: "Pass",
    },
    {
      id: 9,
      features: {
        "Study Hours": 6.2,
        Attendance: 85,
        "Previous Score": 76,
      },
      target: "Pass",
    },
    {
      id: 10,
      features: {
        "Study Hours": 7,
        Attendance: 90,
        "Previous Score": 82,
      },
      target: "Pass",
    },
    {
      id: 11,
      features: {
        "Study Hours": 7.5,
        Attendance: 93,
        "Previous Score": 86,
      },
      target: "Pass",
    },
    {
      id: 12,
      features: {
        "Study Hours": 4.5,
        Attendance: 73,
        "Previous Score": 64,
      },
      target: "Pass",
    },
  ],
};

export const multinomialEmailDataset: DefaultNBDataset = {
  name: "Email Word Counts",
  description:
    "Word-frequency features used to classify emails as Spam or Not Spam.",
  variant: "multinomial",

  features: [
    "Free",
    "Offer",
    "Meeting",
    "Project",
  ],

  targetName: "Email Type",

  rows: [
    {
      id: 1,
      features: {
        Free: 4,
        Offer: 3,
        Meeting: 0,
        Project: 0,
      },
      target: "Spam",
    },
    {
      id: 2,
      features: {
        Free: 3,
        Offer: 4,
        Meeting: 0,
        Project: 0,
      },
      target: "Spam",
    },
    {
      id: 3,
      features: {
        Free: 5,
        Offer: 2,
        Meeting: 0,
        Project: 0,
      },
      target: "Spam",
    },
    {
      id: 4,
      features: {
        Free: 2,
        Offer: 3,
        Meeting: 0,
        Project: 1,
      },
      target: "Spam",
    },
    {
      id: 5,
      features: {
        Free: 4,
        Offer: 2,
        Meeting: 1,
        Project: 0,
      },
      target: "Spam",
    },
    {
      id: 6,
      features: {
        Free: 0,
        Offer: 0,
        Meeting: 4,
        Project: 3,
      },
      target: "Not Spam",
    },
    {
      id: 7,
      features: {
        Free: 0,
        Offer: 1,
        Meeting: 3,
        Project: 4,
      },
      target: "Not Spam",
    },
    {
      id: 8,
      features: {
        Free: 0,
        Offer: 0,
        Meeting: 5,
        Project: 2,
      },
      target: "Not Spam",
    },
    {
      id: 9,
      features: {
        Free: 1,
        Offer: 0,
        Meeting: 3,
        Project: 3,
      },
      target: "Not Spam",
    },
    {
      id: 10,
      features: {
        Free: 0,
        Offer: 0,
        Meeting: 2,
        Project: 5,
      },
      target: "Not Spam",
    },
  ],
};

export const bernoulliEmailDataset: DefaultNBDataset = {
  name: "Email Word Presence",
  description:
    "Binary word-presence features used to classify emails as Spam or Not Spam.",
  variant: "bernoulli",

  features: [
    "Contains Free",
    "Contains Offer",
    "Contains Meeting",
    "Contains Project",
  ],

  targetName: "Email Type",

  rows: [
    {
      id: 1,
      features: {
        "Contains Free": 1,
        "Contains Offer": 1,
        "Contains Meeting": 0,
        "Contains Project": 0,
      },
      target: "Spam",
    },
    {
      id: 2,
      features: {
        "Contains Free": 1,
        "Contains Offer": 1,
        "Contains Meeting": 0,
        "Contains Project": 0,
      },
      target: "Spam",
    },
    {
      id: 3,
      features: {
        "Contains Free": 1,
        "Contains Offer": 0,
        "Contains Meeting": 0,
        "Contains Project": 0,
      },
      target: "Spam",
    },
    {
      id: 4,
      features: {
        "Contains Free": 0,
        "Contains Offer": 1,
        "Contains Meeting": 0,
        "Contains Project": 0,
      },
      target: "Spam",
    },
    {
      id: 5,
      features: {
        "Contains Free": 1,
        "Contains Offer": 1,
        "Contains Meeting": 0,
        "Contains Project": 1,
      },
      target: "Spam",
    },
    {
      id: 6,
      features: {
        "Contains Free": 0,
        "Contains Offer": 0,
        "Contains Meeting": 1,
        "Contains Project": 1,
      },
      target: "Not Spam",
    },
    {
      id: 7,
      features: {
        "Contains Free": 0,
        "Contains Offer": 0,
        "Contains Meeting": 1,
        "Contains Project": 1,
      },
      target: "Not Spam",
    },
    {
      id: 8,
      features: {
        "Contains Free": 0,
        "Contains Offer": 0,
        "Contains Meeting": 1,
        "Contains Project": 0,
      },
      target: "Not Spam",
    },
    {
      id: 9,
      features: {
        "Contains Free": 0,
        "Contains Offer": 1,
        "Contains Meeting": 1,
        "Contains Project": 1,
      },
      target: "Not Spam",
    },
    {
      id: 10,
      features: {
        "Contains Free": 0,
        "Contains Offer": 0,
        "Contains Meeting": 0,
        "Contains Project": 1,
      },
      target: "Not Spam",
    },
  ],
};

export const defaultNBDatasets: Record<
  NaiveBayesVariant,
  DefaultNBDataset
> = {
  gaussian:
    gaussianStudentDataset,

  multinomial:
    multinomialEmailDataset,

  bernoulli:
    bernoulliEmailDataset,
};