export type DatasetRow = Record<
  string,
  string | number | null
>;

export type NumericDataPoint = {
  x: number;
  y: number;
};

export type SuitabilityStatus =
  | "suitable"
  | "warning"
  | "not-suitable";

export type SuitabilityMessage = {
  type: "success" | "warning" | "error";
  title: string;
  message: string;
};

export type LinearRegressionSuitabilityResult = {
  status: SuitabilityStatus;

  usableData: NumericDataPoint[];

  totalRows: number;
  usableRows: number;
  removedRows: number;

  correlation: number | null;

  messages: SuitabilityMessage[];
};