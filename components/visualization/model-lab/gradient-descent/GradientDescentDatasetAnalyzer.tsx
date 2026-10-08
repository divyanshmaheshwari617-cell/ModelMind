// "use client";

// import { useMemo, useState } from "react";
// import Papa from "papaparse";

// import type { RegressionPoint } from "./RegressionAnimation";

// type DatasetRow = Record<
//   string,
//   string | number | null | undefined
// >;

// type Status =
//   | "suitable"
//   | "warning"
//   | "not-suitable";

// type ColumnType =
//   | "numerical"
//   | "categorical"
//   | "unknown";

// type NumericMissingStrategy =
//   | "mean"
//   | "median"
//   | "mode"
//   | "drop";

// type CategoricalMissingStrategy =
//   | "mode"
//   | "unknown"
//   | "drop";

// type CategoricalEncoding =
//   | "label"
//   | "one-hot";

// type Message = {
//   type: "success" | "warning" | "error";
//   title: string;
//   text: string;
// };

// type AnalysisResult = {
//   status: Status;
//   data: RegressionPoint[];
//   totalRows: number;
//   usableRows: number;
//   removedRows: number;
//   messages: Message[];
// };

// type Props = {
//   onUseDataset: (
//     data: RegressionPoint[],
//     featureName: string,
//     targetName: string
//   ) => void;

//   onUseDemo: () => void;

//   activeFeatureName: string;
//   activeTargetName: string;
//   activeSampleCount: number;
//   usingUploadedDataset: boolean;
// };

// function toFiniteNumber(
//   value: string | number | null | undefined
// ): number | null {
//   if (
//     value === null ||
//     value === undefined ||
//     value === ""
//   ) {
//     return null;
//   }

//   const numeric =
//     typeof value === "number"
//       ? value
//       : Number(String(value).trim());

//   return Number.isFinite(numeric)
//     ? numeric
//     : null;
// }
// function isMissing(
//   value: string | number | null | undefined
// ) {
//   return (
//     value === null ||
//     value === undefined ||
//     String(value).trim() === ""
//   );
// }

// function detectColumnType(
//   rows: DatasetRow[],
//   column: string
// ): ColumnType {
//   if (!column || rows.length === 0) {
//     return "unknown";
//   }

//   const presentValues =
//     rows
//       .map((row) => row[column])
//       .filter(
//         (value) =>
//           !isMissing(value)
//       );

//   if (presentValues.length === 0) {
//     return "unknown";
//   }

//   const numericCount =
//     presentValues.filter(
//       (value) =>
//         toFiniteNumber(value) !== null
//     ).length;

//   const numericRatio =
//     numericCount /
//     presentValues.length;

//   return numericRatio >= 0.8
//     ? "numerical"
//     : "categorical";
// }

// function getMissingCount(
//   rows: DatasetRow[],
//   column: string
// ) {
//   if (!column) {
//     return 0;
//   }

//   return rows.filter(
//     (row) =>
//       isMissing(row[column])
//   ).length;
// }

// function getNumericValues(
//   rows: DatasetRow[],
//   column: string
// ) {
//   return rows
//     .map((row) =>
//       toFiniteNumber(
//         row[column]
//       )
//     )
//     .filter(
//       (
//         value
//       ): value is number =>
//         value !== null
//     );
// }

// function calculateMean(
//   values: number[]
// ) {
//   if (values.length === 0) {
//     return null;
//   }

//   return (
//     values.reduce(
//       (sum, value) =>
//         sum + value,
//       0
//     ) / values.length
//   );
// }

// function calculateMedian(
//   values: number[]
// ) {
//   if (values.length === 0) {
//     return null;
//   }

//   const sorted =
//     [...values].sort(
//       (a, b) => a - b
//     );

//   const middle =
//     Math.floor(
//       sorted.length / 2
//     );

//   if (
//     sorted.length % 2 === 0
//   ) {
//     return (
//       sorted[middle - 1] +
//       sorted[middle]
//     ) / 2;
//   }

//   return sorted[middle];
// }

// function calculateNumericMode(
//   values: number[]
// ) {
//   if (values.length === 0) {
//     return null;
//   }

//   const counts =
//     new Map<number, number>();

//   for (const value of values) {
//     counts.set(
//       value,
//       (counts.get(value) ?? 0) + 1
//     );
//   }

//   let selected = values[0];
//   let highestCount = 0;

//   for (
//     const [value, count]
//     of counts
//   ) {
//     if (count > highestCount) {
//       selected = value;
//       highestCount = count;
//     }
//   }

//   return selected;
// }

// function getNumericFillValue(
//   rows: DatasetRow[],
//   column: string,
//   strategy: NumericMissingStrategy
// ) {
//   if (strategy === "drop") {
//     return null;
//   }

//   const values =
//     getNumericValues(
//       rows,
//       column
//     );

//   if (strategy === "mean") {
//     return calculateMean(values);
//   }

//   if (strategy === "median") {
//     return calculateMedian(values);
//   }

//   return calculateNumericMode(
//     values
//   );
// }

// function calculateCategoricalMode(
//   rows: DatasetRow[],
//   column: string
// ) {
//   const values =
//     rows
//       .map((row) =>
//         row[column]
//       )
//       .filter(
//         (value) =>
//           !isMissing(value)
//       )
//       .map((value) =>
//         String(value).trim()
//       );

//   if (values.length === 0) {
//     return null;
//   }

//   const counts =
//     new Map<string, number>();

//   for (const value of values) {
//     counts.set(
//       value,
//       (counts.get(value) ?? 0) + 1
//     );
//   }

//   let selected = values[0];
//   let highestCount = 0;

//   for (
//     const [value, count]
//     of counts
//   ) {
//     if (count > highestCount) {
//       selected = value;
//       highestCount = count;
//     }
//   }

//   return selected;
// }

// function percentile(
//   sorted: number[],
//   p: number
// ) {
//   if (sorted.length === 0) {
//     return 0;
//   }

//   const index =
//     (sorted.length - 1) * p;

//   const lower =
//     Math.floor(index);

//   const upper =
//     Math.ceil(index);

//   if (lower === upper) {
//     return sorted[lower];
//   }

//   const fraction =
//     index - lower;

//   return (
//     sorted[lower] *
//       (1 - fraction) +
//     sorted[upper] *
//       fraction
//   );
// }

// function countOutliers(
//   values: number[]
// ) {
//   if (values.length < 4) {
//     return 0;
//   }

//   const sorted =
//     [...values].sort(
//       (a, b) => a - b
//     );

//   const q1 =
//     percentile(sorted, 0.25);

//   const q3 =
//     percentile(sorted, 0.75);

//   const iqr = q3 - q1;

//   if (iqr === 0) {
//     return 0;
//   }

//   const lower =
//     q1 - 1.5 * iqr;

//   const upper =
//     q3 + 1.5 * iqr;

//   return values.filter(
//     (value) =>
//       value < lower ||
//       value > upper
//   ).length;
// }

// function getScale(
//   values: number[]
// ) {
//   if (values.length === 0) {
//     return 0;
//   }

//   return Math.max(
//     ...values.map(
//       (value) =>
//         Math.abs(value)
//     )
//   );
// }

// function analyzeDataset(
//   rows: DatasetRow[],
//   feature: string,
//   target: string,
//   numericFeatureStrategy: NumericMissingStrategy,
//   numericTargetStrategy: NumericMissingStrategy,
//   categoricalFeatureStrategy: CategoricalMissingStrategy
// ): AnalysisResult {
//   const messages: Message[] = [];

//   if (!feature || !target) {
//     return {
//       status: "not-suitable",
//       data: [],
//       totalRows: rows.length,
//       usableRows: 0,
//       removedRows: rows.length,
//       messages: [
//         {
//           type: "error",
//           title:
//             "Select X and Y",
//           text:
//             "Choose one input feature for X and one numerical target for Y.",
//         },
//       ],
//     };
//   }

//   if (feature === target) {
//     return {
//       status: "not-suitable",
//       data: [],
//       totalRows: rows.length,
//       usableRows: 0,
//       removedRows: rows.length,
//       messages: [
//         {
//           type: "error",
//           title:
//             "X and Y cannot be the same column",
//           text:
//             "Gradient Descent needs an input feature and a separate target for this regression demonstration.",
//         },
//       ],
//     };
//   }

//   const featureNumericCount =
//     rows.filter(
//       (row) =>
//         toFiniteNumber(
//           row[feature]
//         ) !== null
//     ).length;
    

//   const targetNumericCount =
//     rows.filter(
//       (row) =>
//         toFiniteNumber(
//           row[target]
//         ) !== null
//     ).length;

//   const featureRatio =
//     rows.length === 0
//       ? 0
//       : featureNumericCount /
//         rows.length;

//   const targetRatio =
//     rows.length === 0
//       ? 0
//       : targetNumericCount /
//         rows.length;

//   if (featureRatio < 0.8) {
//     messages.push({
//       type: "error",
//       title:
//         "X is not sufficiently numerical",
//       text:
//         `${feature} contains too many non-numeric or missing values for this Gradient Descent regression visualization.`,
//     });
//   }

//   if (targetRatio < 0.8) {
//     messages.push({
//       type: "error",
//       title:
//         "Y is not sufficiently numerical",
//       text:
//         `${target} appears categorical or contains too many non-numeric values. This visualizer currently demonstrates Gradient Descent for numerical regression.`,
//     });
//   }

//   if (
//     featureRatio < 0.8 ||
//     targetRatio < 0.8
//   ) {
//     return {
//       status: "not-suitable",
//       data: [],
//       totalRows: rows.length,
//       usableRows: 0,
//       removedRows: rows.length,
//       messages,
//     };
//   }

//   const data: RegressionPoint[] =
//     rows.flatMap((row) => {
//       const x =
//         toFiniteNumber(
//           row[feature]
//         );

//       const y =
//         toFiniteNumber(
//           row[target]
//         );

//       if (
//         x === null ||
//         y === null
//       ) {
//         return [];
//       }

//       return [{ x, y }];
//     });

//   const removedRows =
//     rows.length - data.length;

//   if (data.length < 3) {
//     return {
//       status: "not-suitable",
//       data,
//       totalRows: rows.length,
//       usableRows: data.length,
//       removedRows,
//       messages: [
//         {
//           type: "error",
//           title:
//             "Not enough usable observations",
//           text:
//             "At least 3 valid numerical X-Y observations are required for this visualization.",
//         },
//       ],
//     };
//   }

//   const uniqueX =
//     new Set(
//       data.map(
//         (point) => point.x
//       )
//     );

//   if (uniqueX.size < 2) {
//     return {
//       status: "not-suitable",
//       data,
//       totalRows: rows.length,
//       usableRows: data.length,
//       removedRows,
//       messages: [
//         {
//           type: "error",
//           title:
//             "X has no useful variation",
//           text:
//             "The selected X column needs at least two different numerical values so Gradient Descent can learn a weight.",
//         },
//       ],
//     };
//   }

//   if (removedRows > 0) {
//     messages.push({
//       type: "warning",
//       title:
//         "Some rows will be ignored",
//       text:
//         `${removedRows} row(s) contain missing or invalid X/Y values and will not participate in training.`,
//     });
//   }

//   const xValues =
//     data.map(
//       (point) => point.x
//     );

//   const yValues =
//     data.map(
//       (point) => point.y
//     );

//   const xScale =
//     getScale(xValues);

//   const yScale =
//     getScale(yValues);

//   const smallerScale =
//     Math.min(
//       xScale || 1,
//       yScale || 1
//     );

//   const largerScale =
//     Math.max(
//       xScale,
//       yScale
//     );

//   const scaleRatio =
//     largerScale /
//     smallerScale;

//   if (
//     largerScale >= 1000 ||
//     scaleRatio >= 100
//   ) {
//     messages.push({
//       type: "warning",
//       title:
//         "Large numerical scale detected",
//       text:
//         "Gradient Descent may become unstable with the current learning rate. Try a smaller learning rate or scale the data if the loss grows instead of decreasing.",
//     });
//   } else {
//     messages.push({
//       type: "success",
//       title:
//         "Scale looks manageable",
//       text:
//         "The selected values do not show an obvious extreme scale difference for this learning visualization.",
//     });
//   }

//   const xOutliers =
//     countOutliers(xValues);

//   const yOutliers =
//     countOutliers(yValues);

//   if (
//     xOutliers > 0 ||
//     yOutliers > 0
//   ) {
//     messages.push({
//       type: "warning",
//       title:
//         "Possible outliers detected",
//       text:
//         `IQR analysis found ${xOutliers} possible X outlier(s) and ${yOutliers} possible Y outlier(s). Outliers can strongly affect gradients and squared-error loss.`,
//     });
//   }

//   messages.push({
//     type: "success",
//     title:
//       "Dataset can be used",
//     text:
//       `Gradient Descent can demonstrate numerical regression using ${feature} → ${target} with ${data.length} usable observations.`,
//   });

//   const hasWarning =
//     messages.some(
//       (message) =>
//         message.type ===
//         "warning"
//     );

//   return {
//     status:
//       hasWarning
//         ? "warning"
//         : "suitable",
//     data,
//     totalRows: rows.length,
//     usableRows: data.length,
//     removedRows,
//     messages,
//   };
// }

// export default function GradientDescentDatasetAnalyzer({
//   onUseDataset,
//   onUseDemo,
//   activeFeatureName,
//   activeTargetName,
//   activeSampleCount,
//   usingUploadedDataset,
// }: Props) {
//   const [rows, setRows] =
//     useState<DatasetRow[]>([]);

//   const [columns, setColumns] =
//     useState<string[]>([]);

//   const [feature, setFeature] =
//     useState("");

//   const [target, setTarget] =
//     useState("");

//   const [fileName, setFileName] =
//     useState("");

//   const [parseError, setParseError] =
//     useState("");

//   const analysis =
//     useMemo(
//       () =>
//         analyzeDataset(
//           rows,
//           feature,
//           target
//         ),
//       [rows, feature, target]
//     );

//   function handleFile(
//     file: File | undefined
//   ) {
//     if (!file) {
//       return;
//     }

//     setParseError("");
//     setFileName(file.name);

//     Papa.parse<DatasetRow>(
//       file,
//       {
//         header: true,
//         skipEmptyLines: true,
//         dynamicTyping: true,

//         complete: (result) => {
//           const parsedRows =
//             result.data.filter(
//               (row) =>
//                 Object.values(
//                   row
//                 ).some(
//                   (value) =>
//                     value !== null &&
//                     value !==
//                       undefined &&
//                     value !== ""
//                 )
//             );

//           const fields =
//             result.meta.fields ??
//             [];

//           if (
//             fields.length < 2
//           ) {
//             setRows([]);
//             setColumns([]);
//             setFeature("");
//             setTarget("");

//             setParseError(
//               "The CSV needs at least two columns."
//             );

//             return;
//           }

//           setRows(parsedRows);
//           setColumns(fields);

//           setFeature(
//             fields[0] ?? ""
//           );

//           setTarget(
//             fields[1] ?? ""
//           );

//           if (
//             result.errors.length >
//             0
//           ) {
//             setParseError(
//               "The CSV was loaded, but Papa Parse reported formatting warnings. Check the selected columns and usable row count."
//             );
//           }
//         },

//         error: () => {
//           setRows([]);
//           setColumns([]);
//           setFeature("");
//           setTarget("");

//           setParseError(
//             "ModelMind could not read this CSV file."
//           );
//         },
//       }
//     );
//   }

//   const statusText =
//     analysis.status ===
//     "suitable"
//       ? "Suitable"
//       : analysis.status ===
//           "warning"
//         ? "Suitable with Warnings"
//         : "Not Appropriate";

//   return (
//     <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
//       <div className="flex flex-wrap items-start justify-between gap-4">
//         <div>
//           <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
//             Dataset Intelligence
//           </p>

//           <h2 className="mt-2 text-xl font-semibold text-zinc-100">
//             Train Gradient Descent
//             on Your Dataset
//           </h2>

//           <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
//             Upload a CSV, choose one
//             numerical X feature and
//             one numerical Y target,
//             then inspect whether the
//             data is appropriate for
//             this regression-based
//             Gradient Descent
//             visualization.
//           </p>
//         </div>

//         <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
//           <p className="text-xs text-zinc-500">
//             Active data
//           </p>

//           <p className="mt-1 text-sm font-semibold text-zinc-100">
//             {usingUploadedDataset
//               ? `${activeFeatureName} → ${activeTargetName}`
//               : "Demo dataset"}
//           </p>

//           <p className="mt-1 text-xs text-zinc-500">
//             {activeSampleCount} samples
//           </p>
//         </div>
//       </div>

//       <div className="mt-6 grid gap-4 lg:grid-cols-3">
//         <label className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4">
//           <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
//             CSV Dataset
//           </span>

//           <input
//             type="file"
//             accept=".csv,text/csv"
//             onChange={(event) =>
//               handleFile(
//                 event.target
//                   .files?.[0]
//               )
//             }
//             className="mt-3 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-950"
//           />

//           {fileName && (
//             <p className="mt-3 break-all text-xs text-zinc-500">
//               {fileName}
//             </p>
//           )}
//         </label>

//         <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
//           <label
//             htmlFor="gd-feature"
//             className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
//           >
//             Feature X
//           </label>

//           <select
//             id="gd-feature"
//             value={feature}
//             onChange={(event) =>
//               setFeature(
//                 event.target.value
//               )
//             }
//             disabled={
//               columns.length === 0
//             }
//             className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
//           >
//             {columns.length ===
//               0 && (
//               <option value="">
//                 Upload CSV first
//               </option>
//             )}

//             {columns.map(
//               (column) => (
//                 <option
//                   key={column}
//                   value={column}
//                 >
//                   {column}
//                 </option>
//               )
//             )}
//           </select>
//         </div>

//         <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
//           <label
//             htmlFor="gd-target"
//             className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
//           >
//             Target Y
//           </label>

//           <select
//             id="gd-target"
//             value={target}
//             onChange={(event) =>
//               setTarget(
//                 event.target.value
//               )
//             }
//             disabled={
//               columns.length === 0
//             }
//             className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
//           >
//             {columns.length ===
//               0 && (
//               <option value="">
//                 Upload CSV first
//               </option>
//             )}

//             {columns.map(
//               (column) => (
//                 <option
//                   key={column}
//                   value={column}
//                 >
//                   {column}
//                 </option>
//               )
//             )}
//           </select>
//         </div>
//       </div>

//       {parseError && (
//         <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm leading-6 text-amber-200">
//           {parseError}
//         </div>
//       )}

//       {rows.length > 0 && (
//         <>
//           <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//             <InfoCard
//               label="Status"
//               value={statusText}
//             />

//             <InfoCard
//               label="CSV Rows"
//               value={String(
//                 analysis.totalRows
//               )}
//             />

//             <InfoCard
//               label="Usable Rows"
//               value={String(
//                 analysis.usableRows
//               )}
//             />

//             <InfoCard
//               label="Removed Rows"
//               value={String(
//                 analysis.removedRows
//               )}
//             />
//           </div>

//           <div className="mt-5 space-y-3">
//             {analysis.messages.map(
//               (
//                 message,
//                 index
//               ) => (
//                 <MessageCard
//                   key={`${message.title}-${index}`}
//                   message={
//                     message
//                   }
//                 />
//               )
//             )}
//           </div>

//           <div className="mt-5 flex flex-wrap gap-3">
//             {analysis.status !==
//               "not-suitable" && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   onUseDataset(
//                     analysis.data,
//                     feature,
//                     target
//                   )
//                 }
//                 className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-white"
//               >
//                 Use Dataset in
//                 Gradient Descent
//               </button>
//             )}

//             {usingUploadedDataset && (
//               <button
//                 type="button"
//                 onClick={
//                   onUseDemo
//                 }
//                 className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900"
//               >
//                 Return to Demo Dataset
//               </button>
//             )}
//           </div>
//         </>
//       )}

//       <div className="mt-5 rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
//         <p className="text-sm font-semibold text-blue-200">
//           What is ModelMind
//           checking?
//         </p>

//         <p className="mt-2 text-sm leading-6 text-zinc-400">
//           This check is about whether
//           the selected data can be
//           used to demonstrate
//           Gradient Descent for a
//           one-feature numerical
//           regression problem. It does
//           not claim that Gradient
//           Descent or Linear
//           Regression is the best
//           model for the dataset.
//         </p>
//       </div>
//     </div>
//   );
// }

// function InfoCard({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
//       <p className="text-xs text-zinc-500">
//         {label}
//       </p>

//       <p className="mt-2 font-mono text-sm font-semibold text-zinc-100">
//         {value}
//       </p>
//     </div>
//   );
// }

// function MessageCard({
//   message,
// }: {
//   message: Message;
// }) {
//   const classes =
//     message.type === "error"
//       ? "border-red-900/60 bg-red-950/30"
//       : message.type ===
//           "warning"
//         ? "border-amber-900/60 bg-amber-950/30"
//         : "border-emerald-900/60 bg-emerald-950/30";

//   const titleClass =
//     message.type === "error"
//       ? "text-red-300"
//       : message.type ===
//           "warning"
//         ? "text-amber-300"
//         : "text-emerald-300";

//   return (
//     <div
//       className={`rounded-xl border p-4 ${classes}`}
//     >
//       <p
//         className={`text-sm font-semibold ${titleClass}`}
//       >
//         {message.title}
//       </p>

//       <p className="mt-2 text-sm leading-6 text-zinc-400">
//         {message.text}
//       </p>
//     </div>
//   );
// }


"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

import type { RegressionPoint } from "./RegressionAnimation";

type DatasetRow = Record<
  string,
  string | number | null | undefined
>;

type Status =
  | "suitable"
  | "warning"
  | "not-suitable";

type ColumnType =
  | "numerical"
  | "categorical"
  | "unknown";

type NumericMissingStrategy =
  | "mean"
  | "median"
  | "mode"
  | "drop";

type CategoricalMissingStrategy =
  | "mode"
  | "unknown"
  | "drop";

type Message = {
  type: "success" | "warning" | "error";
  title: string;
  text: string;
};

type AnalysisResult = {
  status: Status;
  data: RegressionPoint[];
  totalRows: number;
  usableRows: number;
  removedRows: number;
  messages: Message[];
};

type Props = {
  onUseDataset: (
    data: RegressionPoint[],
    featureName: string,
    targetName: string
  ) => void;

  onUseDemo: () => void;

  activeFeatureName: string;
  activeTargetName: string;
  activeSampleCount: number;
  usingUploadedDataset: boolean;
};

function toFiniteNumber(
  value: string | number | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).trim());

  return Number.isFinite(numeric)
    ? numeric
    : null;
}

function isMissing(
  value: string | number | null | undefined
) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );
}

function detectColumnType(
  rows: DatasetRow[],
  column: string
): ColumnType {
  if (
    !column ||
    rows.length === 0
  ) {
    return "unknown";
  }

  const presentValues =
    rows
      .map(
        (row) => row[column]
      )
      .filter(
        (value) =>
          !isMissing(value)
      );

  if (
    presentValues.length === 0
  ) {
    return "unknown";
  }

  const numericCount =
    presentValues.filter(
      (value) =>
        toFiniteNumber(value) !==
        null
    ).length;

  const numericRatio =
    numericCount /
    presentValues.length;

  return numericRatio >= 0.8
    ? "numerical"
    : "categorical";
}

function getMissingCount(
  rows: DatasetRow[],
  column: string
) {
  if (!column) {
    return 0;
  }

  return rows.filter(
    (row) =>
      isMissing(
        row[column]
      )
  ).length;
}

function getNumericValues(
  rows: DatasetRow[],
  column: string
) {
  return rows
    .map(
      (row) =>
        toFiniteNumber(
          row[column]
        )
    )
    .filter(
      (
        value
      ): value is number =>
        value !== null
    );
}

function calculateMean(
  values: number[]
) {
  if (
    values.length === 0
  ) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    values.length
  );
}

function calculateMedian(
  values: number[]
) {
  if (
    values.length === 0
  ) {
    return null;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 ===
    0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

function calculateNumericMode(
  values: number[]
) {
  if (
    values.length === 0
  ) {
    return null;
  }

  const counts =
    new Map<
      number,
      number
    >();

  for (
    const value of values
  ) {
    counts.set(
      value,
      (counts.get(value) ??
        0) + 1
    );
  }

  let selected =
    values[0];

  let highestCount = 0;

  for (
    const [
      value,
      count,
    ] of counts
  ) {
    if (
      count >
      highestCount
    ) {
      selected = value;
      highestCount =
        count;
    }
  }

  return selected;
}

function getNumericFillValue(
  rows: DatasetRow[],
  column: string,
  strategy: NumericMissingStrategy
) {
  if (
    strategy === "drop"
  ) {
    return null;
  }

  const values =
    getNumericValues(
      rows,
      column
    );

  if (
    strategy === "mean"
  ) {
    return calculateMean(
      values
    );
  }

  if (
    strategy === "median"
  ) {
    return calculateMedian(
      values
    );
  }

  return calculateNumericMode(
    values
  );
}

function calculateCategoricalMode(
  rows: DatasetRow[],
  column: string
) {
  const values =
    rows
      .map(
        (row) =>
          row[column]
      )
      .filter(
        (value) =>
          !isMissing(value)
      )
      .map(
        (value) =>
          String(
            value
          ).trim()
      );

  if (
    values.length === 0
  ) {
    return null;
  }

  const counts =
    new Map<
      string,
      number
    >();

  for (
    const value of values
  ) {
    counts.set(
      value,
      (counts.get(value) ??
        0) + 1
    );
  }

  let selected =
    values[0];

  let highestCount = 0;

  for (
    const [
      value,
      count,
    ] of counts
  ) {
    if (
      count >
      highestCount
    ) {
      selected = value;
      highestCount =
        count;
    }
  }

  return selected;
}

function percentile(
  sorted: number[],
  p: number
) {
  if (
    sorted.length === 0
  ) {
    return 0;
  }

  const index =
    (sorted.length - 1) *
    p;

  const lower =
    Math.floor(index);

  const upper =
    Math.ceil(index);

  if (
    lower === upper
  ) {
    return sorted[lower];
  }

  const fraction =
    index - lower;

  return (
    sorted[lower] *
      (1 - fraction) +
    sorted[upper] *
      fraction
  );
}

function countOutliers(
  values: number[]
) {
  if (
    values.length < 4
  ) {
    return 0;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const q1 =
    percentile(
      sorted,
      0.25
    );

  const q3 =
    percentile(
      sorted,
      0.75
    );

  const iqr =
    q3 - q1;

  if (iqr === 0) {
    return 0;
  }

  const lower =
    q1 - 1.5 * iqr;

  const upper =
    q3 + 1.5 * iqr;

  return values.filter(
    (value) =>
      value < lower ||
      value > upper
  ).length;
}

function getScale(
  values: number[]
) {
  if (
    values.length === 0
  ) {
    return 0;
  }

  return Math.max(
    ...values.map(
      (value) =>
        Math.abs(value)
    )
  );
}

function analyzeDataset(
  rows: DatasetRow[],
  feature: string,
  target: string,
  numericFeatureStrategy:
    NumericMissingStrategy,
  numericTargetStrategy:
    NumericMissingStrategy,
  categoricalFeatureStrategy:
    CategoricalMissingStrategy
): AnalysisResult {
  const messages: Message[] =
    [];

  if (
    !feature ||
    !target
  ) {
    return {
      status:
        "not-suitable",
      data: [],
      totalRows:
        rows.length,
      usableRows: 0,
      removedRows:
        rows.length,
      messages: [
        {
          type: "error",
          title:
            "Select X and Y",
          text:
            "Choose one input feature for X and one numerical target for Y.",
        },
      ],
    };
  }

  if (
    feature === target
  ) {
    return {
      status:
        "not-suitable",
      data: [],
      totalRows:
        rows.length,
      usableRows: 0,
      removedRows:
        rows.length,
      messages: [
        {
          type: "error",
          title:
            "X and Y cannot be the same column",
          text:
            "Gradient Descent needs an input feature and a separate target for this regression demonstration.",
        },
      ],
    };
  }

  const featureType =
    detectColumnType(
      rows,
      feature
    );

  const targetType =
    detectColumnType(
      rows,
      target
    );

  const featureMissingCount =
    getMissingCount(
      rows,
      feature
    );

  const targetMissingCount =
    getMissingCount(
      rows,
      target
    );

  if (
    featureType ===
    "unknown"
  ) {
    return {
      status:
        "not-suitable",
      data: [],
      totalRows:
        rows.length,
      usableRows: 0,
      removedRows:
        rows.length,
      messages: [
        {
          type: "error",
          title:
            "X contains no usable values",
          text:
            `${feature} does not contain enough usable values to prepare an input feature.`,
        },
      ],
    };
  }

  if (
    targetType !==
    "numerical"
  ) {
    return {
      status:
        "not-suitable",
      data: [],
      totalRows:
        rows.length,
      usableRows: 0,
      removedRows:
        rows.length,
      messages: [
        {
          type: "error",
          title:
            "Y must be numerical",
          text:
            `${target} appears categorical or does not contain enough numerical values. Choose a numerical target for Gradient Descent regression.`,
        },
      ],
    };
  }

  const numericFeatureFill =
    featureType ===
    "numerical"
      ? getNumericFillValue(
          rows,
          feature,
          numericFeatureStrategy
        )
      : null;

  const numericTargetFill =
    getNumericFillValue(
      rows,
      target,
      numericTargetStrategy
    );

  const categoricalFeatureFill =
    featureType ===
    "categorical"
      ? categoricalFeatureStrategy ===
        "unknown"
        ? "Unknown"
        : categoricalFeatureStrategy ===
            "mode"
          ? calculateCategoricalMode(
              rows,
              feature
            )
          : null
      : null;

  const categoricalValues =
    featureType ===
    "categorical"
      ? Array.from(
          new Set(
            rows
              .map(
                (row) => {
                  const value =
                    row[
                      feature
                    ];

                  if (
                    isMissing(
                      value
                    )
                  ) {
                    return categoricalFeatureFill;
                  }

                  return String(
                    value
                  ).trim();
                }
              )
              .filter(
                (
                  value
                ): value is string =>
                  value !==
                  null
              )
          )
        )
      : [];

  const categoryMap =
    new Map<
      string,
      number
    >();

  categoricalValues.forEach(
    (
      value,
      index
    ) => {
      categoryMap.set(
        value,
        index
      );
    }
  );

  const data: RegressionPoint[] =
    rows.flatMap(
      (row) => {
        let x:
          | number
          | null = null;

        let y:
          | number
          | null = null;

        if (
          featureType ===
          "numerical"
        ) {
          const rawX =
            toFiniteNumber(
              row[
                feature
              ]
            );

          if (
            rawX !== null
          ) {
            x = rawX;
          } else if (
            numericFeatureStrategy !==
              "drop" &&
            numericFeatureFill !==
              null
          ) {
            x =
              numericFeatureFill;
          }
        } else {
          const rawFeature =
            row[
              feature
            ];

          let category:
            | string
            | null =
            null;

          if (
            !isMissing(
              rawFeature
            )
          ) {
            category =
              String(
                rawFeature
              ).trim();
          } else if (
            categoricalFeatureStrategy !==
              "drop" &&
            categoricalFeatureFill !==
              null
          ) {
            category =
              categoricalFeatureFill;
          }

          if (
            category !==
            null
          ) {
            x =
              categoryMap.get(
                category
              ) ??
              null;
          }
        }

        const rawY =
          toFiniteNumber(
            row[target]
          );

        if (
          rawY !== null
        ) {
          y = rawY;
        } else if (
          numericTargetStrategy !==
            "drop" &&
          numericTargetFill !==
            null
        ) {
          y =
            numericTargetFill;
        }

        if (
          x === null ||
          y === null
        ) {
          return [];
        }

        return [
          { x, y },
        ];
      }
    );

  const removedRows =
    rows.length -
    data.length;

  if (
    featureMissingCount >
    0
  ) {
    messages.push({
      type: "warning",
      title:
        "Missing values detected in X",
      text:
        `${feature} contains ${featureMissingCount} missing value(s). Your selected preprocessing method will be used before training.`,
    });
  }

  if (
    targetMissingCount >
    0
  ) {
    messages.push({
      type: "warning",
      title:
        "Missing values detected in Y",
      text:
        `${target} contains ${targetMissingCount} missing value(s). Your selected preprocessing method will be used before training.`,
    });
  }

  if (
    featureType ===
    "categorical"
  ) {
    messages.push({
      type: "warning",
      title:
        "Categorical X detected",
      text:
        `${feature} is categorical. ModelMind converts its categories into numerical labels so the existing one-feature Gradient Descent visualization can use the prepared data. Label encoding does not mean the categories have a true numerical order.`,
    });
  }

  if (
    data.length < 3
  ) {
    return {
      status:
        "not-suitable",
      data,
      totalRows:
        rows.length,
      usableRows:
        data.length,
      removedRows,
      messages: [
        ...messages,
        {
          type: "error",
          title:
            "Not enough usable observations",
          text:
            "At least 3 prepared X-Y observations are required for this visualization.",
        },
      ],
    };
  }

  const uniqueX =
    new Set(
      data.map(
        (point) =>
          point.x
      )
    );

  if (
    uniqueX.size < 2
  ) {
    return {
      status:
        "not-suitable",
      data,
      totalRows:
        rows.length,
      usableRows:
        data.length,
      removedRows,
      messages: [
        ...messages,
        {
          type: "error",
          title:
            "X has no useful variation",
          text:
            "The prepared X column needs at least two different values so Gradient Descent can learn a weight.",
        },
      ],
    };
  }

  if (
    removedRows > 0
  ) {
    messages.push({
      type: "warning",
      title:
        "Some rows were removed",
      text:
        `${removedRows} row(s) could not be used after the selected preprocessing.`,
    });
  }

  const xValues =
    data.map(
      (point) =>
        point.x
    );

  const yValues =
    data.map(
      (point) =>
        point.y
    );

  const xScale =
    getScale(
      xValues
    );

  const yScale =
    getScale(
      yValues
    );

  const smallerScale =
    Math.min(
      xScale || 1,
      yScale || 1
    );

  const largerScale =
    Math.max(
      xScale,
      yScale
    );

  const scaleRatio =
    largerScale /
    smallerScale;

  if (
    largerScale >=
      1000 ||
    scaleRatio >= 100
  ) {
    messages.push({
      type: "warning",
      title:
        "Large numerical scale detected",
      text:
        "Gradient Descent may become unstable with the current learning rate. Try a smaller learning rate or scale the data if the loss grows instead of decreasing.",
    });
  } else {
    messages.push({
      type: "success",
      title:
        "Scale looks manageable",
      text:
        "The selected values do not show an obvious extreme scale difference for this learning visualization.",
    });
  }

  const xOutliers =
    countOutliers(
      xValues
    );

  const yOutliers =
    countOutliers(
      yValues
    );

  if (
    xOutliers > 0 ||
    yOutliers > 0
  ) {
    messages.push({
      type: "warning",
      title:
        "Possible outliers detected",
      text:
        `IQR analysis found ${xOutliers} possible X outlier(s) and ${yOutliers} possible Y outlier(s). Outliers can strongly affect gradients and squared-error loss.`,
    });
  }

  messages.push({
    type: "success",
    title:
      "Dataset can be used",
    text:
      `Gradient Descent can demonstrate regression using ${feature} → ${target} with ${data.length} usable observations.`,
  });

  const hasWarning =
    messages.some(
      (message) =>
        message.type ===
        "warning"
    );

  return {
    status:
      hasWarning
        ? "warning"
        : "suitable",
    data,
    totalRows:
      rows.length,
    usableRows:
      data.length,
    removedRows,
    messages,
  };
}

export default function GradientDescentDatasetAnalyzer({
  onUseDataset,
  onUseDemo,
  activeFeatureName,
  activeTargetName,
  activeSampleCount,
  usingUploadedDataset,
}: Props) {
  const [
    rows,
    setRows,
  ] =
    useState<
      DatasetRow[]
    >([]);

  const [
    columns,
    setColumns,
  ] =
    useState<
      string[]
    >([]);

  const [
    feature,
    setFeature,
  ] =
    useState("");

  const [
    target,
    setTarget,
  ] =
    useState("");

  const [
    fileName,
    setFileName,
  ] =
    useState("");

  const [
    parseError,
    setParseError,
  ] =
    useState("");

  const [
    numericFeatureStrategy,
    setNumericFeatureStrategy,
  ] =
    useState<
      NumericMissingStrategy
    >("median");

  const [
    numericTargetStrategy,
    setNumericTargetStrategy,
  ] =
    useState<
      NumericMissingStrategy
    >("median");

  const [
    categoricalFeatureStrategy,
    setCategoricalFeatureStrategy,
  ] =
    useState<
      CategoricalMissingStrategy
    >("mode");

  const [
    numericFeatureStrategyChosen,
    setNumericFeatureStrategyChosen,
  ] =
    useState(false);

  const [
    numericTargetStrategyChosen,
    setNumericTargetStrategyChosen,
  ] =
    useState(false);

  const [
    categoricalFeatureStrategyChosen,
    setCategoricalFeatureStrategyChosen,
  ] =
    useState(false);

  const featureType =
    useMemo(
      () =>
        detectColumnType(
          rows,
          feature
        ),
      [
        rows,
        feature,
      ]
    );

  const targetType =
    useMemo(
      () =>
        detectColumnType(
          rows,
          target
        ),
      [
        rows,
        target,
      ]
    );

  const featureMissingCount =
    useMemo(
      () =>
        getMissingCount(
          rows,
          feature
        ),
      [
        rows,
        feature,
      ]
    );

  const targetMissingCount =
    useMemo(
      () =>
        getMissingCount(
          rows,
          target
        ),
      [
        rows,
        target,
      ]
    );

  const featureMissingChoiceRequired =
    featureMissingCount >
      0 &&
    (
      (
        featureType ===
          "numerical" &&
        !numericFeatureStrategyChosen
      ) ||
      (
        featureType ===
          "categorical" &&
        !categoricalFeatureStrategyChosen
      )
    );

  const targetMissingChoiceRequired =
    targetMissingCount >
      0 &&
    targetType ===
      "numerical" &&
    !numericTargetStrategyChosen;

  const missingChoiceRequired =
    featureMissingChoiceRequired ||
    targetMissingChoiceRequired;

  const analysis =
    useMemo(
      () =>
        analyzeDataset(
          rows,
          feature,
          target,
          numericFeatureStrategy,
          numericTargetStrategy,
          categoricalFeatureStrategy
        ),
      [
        rows,
        feature,
        target,
        numericFeatureStrategy,
        numericTargetStrategy,
        categoricalFeatureStrategy,
      ]
    );

  function resetPreprocessingChoices() {
    setNumericFeatureStrategyChosen(
      false
    );

    setNumericTargetStrategyChosen(
      false
    );

    setCategoricalFeatureStrategyChosen(
      false
    );
  }

  function handleFile(
    file:
      | File
      | undefined
  ) {
    if (!file) {
      return;
    }

    setParseError("");
    setFileName(
      file.name
    );

    resetPreprocessingChoices();

    Papa.parse<DatasetRow>(
  file,
  {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    worker: true,

        complete:
          (result) => {
            const parsedRows =
              result.data.filter(
                (row) =>
                  Object.values(
                    row
                  ).some(
                    (value) =>
                      value !==
                        null &&
                      value !==
                        undefined &&
                      value !==
                        ""
                  )
              );

            const fields =
              result.meta
                .fields ??
              [];

            if (
              fields.length <
              2
            ) {
              setRows([]);
              setColumns(
                []
              );
              setFeature(
                ""
              );
              setTarget(
                ""
              );

              setParseError(
                "The CSV needs at least two columns."
              );

              return;
            }

            setRows(
              parsedRows
            );

            setColumns(
              fields
            );

            setFeature(
              fields[0] ??
                ""
            );

            setTarget(
              fields[1] ??
                ""
            );

            resetPreprocessingChoices();

            if (
              result.errors
                .length > 0
            ) {
              setParseError(
                "The CSV was loaded, but Papa Parse reported formatting warnings. Check the selected columns and usable row count."
              );
            }
          },

        error: () => {
          setRows([]);
          setColumns([]);
          setFeature("");
          setTarget("");

          resetPreprocessingChoices();

          setParseError(
            "ModelMind could not read this CSV file."
          );
        },
      }
    );
  }

  const statusText =
    missingChoiceRequired
      ? "Waiting for Preprocessing"
      : analysis.status ===
          "suitable"
        ? "Suitable"
        : analysis.status ===
            "warning"
          ? "Suitable with Warnings"
          : "Not Appropriate";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Dataset Intelligence
          </p>

          <h2 className="mt-2 text-xl font-semibold text-zinc-100">
            Train Gradient Descent
            on Your Dataset
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            Upload a CSV,
            choose one X
            feature and one
            numerical Y target.
            ModelMind will
            inspect column
            types, missing
            values, scale and
            outliers before
            sending the
            prepared data to
            the existing
            Gradient Descent
            visualization.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Active data
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-100">
            {usingUploadedDataset
              ? `${activeFeatureName} → ${activeTargetName}`
              : "Demo dataset"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {
              activeSampleCount
            }{" "}
            samples
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <label className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            CSV Dataset
          </span>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(
              event
            ) =>
              handleFile(
                event
                  .target
                  .files?.[0]
              )
            }
            className="mt-3 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-950"
          />

          {fileName && (
            <p className="mt-3 break-all text-xs text-zinc-500">
              {fileName}
            </p>
          )}
        </label>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <label
            htmlFor="gd-feature"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Feature X
          </label>

          <select
            id="gd-feature"
            value={
              feature
            }
            onChange={(
              event
            ) => {
              setFeature(
                event.target
                  .value
              );

              setNumericFeatureStrategyChosen(
                false
              );

              setCategoricalFeatureStrategyChosen(
                false
              );
            }}
            disabled={
              columns.length ===
              0
            }
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
          >
            {columns.length ===
              0 && (
              <option value="">
                Upload CSV
                first
              </option>
            )}

            {columns.map(
              (column) => (
                <option
                  key={
                    column
                  }
                  value={
                    column
                  }
                >
                  {
                    column
                  }
                </option>
              )
            )}
          </select>

          {rows.length >
            0 &&
            feature && (
              <p className="mt-3 text-xs text-zinc-500">
                Detected:{" "}
                <span className="font-semibold text-zinc-300">
                  {
                    featureType
                  }
                </span>
                {" • "}
                {
                  featureMissingCount
                }{" "}
                missing
              </p>
            )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <label
            htmlFor="gd-target"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Target Y
          </label>

          <select
            id="gd-target"
            value={
              target
            }
            onChange={(
              event
            ) => {
              setTarget(
                event.target
                  .value
              );

              setNumericTargetStrategyChosen(
                false
              );
            }}
            disabled={
              columns.length ===
              0
            }
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
          >
            {columns.length ===
              0 && (
              <option value="">
                Upload CSV
                first
              </option>
            )}

            {columns.map(
              (column) => (
                <option
                  key={
                    column
                  }
                  value={
                    column
                  }
                >
                  {
                    column
                  }
                </option>
              )
            )}
          </select>

          {rows.length >
            0 &&
            target && (
              <p className="mt-3 text-xs text-zinc-500">
                Detected:{" "}
                <span className="font-semibold text-zinc-300">
                  {
                    targetType
                  }
                </span>
                {" • "}
                {
                  targetMissingCount
                }{" "}
                missing
              </p>
            )}
        </div>
      </div>

      {parseError && (
        <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm leading-6 text-amber-200">
          {
            parseError
          }
        </div>
      )}

      {rows.length >
        0 && (
        <>
          {featureMissingCount >
            0 && (
            <div className="mt-5 rounded-xl border border-amber-800/60 bg-amber-950/20 p-5">
              <p className="text-sm font-semibold text-amber-300">
                Missing
                values in X
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {
                    feature
                  }
                </span>{" "}
                contains{" "}
                <span className="font-semibold text-amber-300">
                  {
                    featureMissingCount
                  }
                </span>{" "}
                missing
                value(s).
                Choose how
                ModelMind
                should handle
                them.
              </p>

              {featureType ===
                "numerical" && (
                <select
                  value={
                    numericFeatureStrategyChosen
                      ? numericFeatureStrategy
                      : ""
                  }
                  onChange={(
                    event
                  ) => {
                    setNumericFeatureStrategy(
                      event
                        .target
                        .value as NumericMissingStrategy
                    );

                    setNumericFeatureStrategyChosen(
                      true
                    );
                  }}
                  className="mt-4 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
                >
                  <option
                    value=""
                    disabled
                  >
                    Choose
                    method...
                  </option>

                  <option value="mean">
                    Fill with
                    Mean
                  </option>

                  <option value="median">
                    Fill with
                    Median
                  </option>

                  <option value="mode">
                    Fill with
                    Mode
                  </option>

                  <option value="drop">
                    Drop rows
                    with missing
                    X
                  </option>
                </select>
              )}

              {featureType ===
                "categorical" && (
                <select
                  value={
                    categoricalFeatureStrategyChosen
                      ? categoricalFeatureStrategy
                      : ""
                  }
                  onChange={(
                    event
                  ) => {
                    setCategoricalFeatureStrategy(
                      event
                        .target
                        .value as CategoricalMissingStrategy
                    );

                    setCategoricalFeatureStrategyChosen(
                      true
                    );
                  }}
                  className="mt-4 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
                >
                  <option
                    value=""
                    disabled
                  >
                    Choose
                    method...
                  </option>

                  <option value="mode">
                    Fill with
                    Mode
                  </option>

                  <option value="unknown">
                    Fill with
                    "Unknown"
                  </option>

                  <option value="drop">
                    Drop rows
                    with missing
                    X
                  </option>
                </select>
              )}
            </div>
          )}

          {targetMissingCount >
            0 &&
            targetType ===
              "numerical" && (
              <div className="mt-5 rounded-xl border border-amber-800/60 bg-amber-950/20 p-5">
                <p className="text-sm font-semibold text-amber-300">
                  Missing
                  values in Y
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {
                      target
                    }
                  </span>{" "}
                  contains{" "}
                  <span className="font-semibold text-amber-300">
                    {
                      targetMissingCount
                    }
                  </span>{" "}
                  missing
                  value(s).
                  Choose how
                  ModelMind
                  should handle
                  them.
                </p>

                <select
                  value={
                    numericTargetStrategyChosen
                      ? numericTargetStrategy
                      : ""
                  }
                  onChange={(
                    event
                  ) => {
                    setNumericTargetStrategy(
                      event
                        .target
                        .value as NumericMissingStrategy
                    );

                    setNumericTargetStrategyChosen(
                      true
                    );
                  }}
                  className="mt-4 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
                >
                  <option
                    value=""
                    disabled
                  >
                    Choose
                    method...
                  </option>

                  <option value="mean">
                    Fill with
                    Mean
                  </option>

                  <option value="median">
                    Fill with
                    Median
                  </option>

                  <option value="mode">
                    Fill with
                    Mode
                  </option>

                  <option value="drop">
                    Drop rows
                    with missing
                    Y
                  </option>
                </select>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  For a
                  regression
                  target,
                  dropping
                  missing Y
                  values is
                  often safer
                  than
                  inventing
                  target
                  labels.
                  ModelMind
                  still lets
                  you choose
                  for learning
                  purposes.
                </p>
              </div>
            )}

          {missingChoiceRequired && (
            <div className="mt-5 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4">
              <p className="text-sm font-semibold text-amber-300">
                Preprocessing
                choice
                required
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                ModelMind
                detected
                missing
                values.
                Choose a
                handling
                method above
                before this
                dataset can
                be sent to
                Gradient
                Descent.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Status"
              value={
                statusText
              }
            />

            <InfoCard
              label="CSV Rows"
              value={String(
                analysis.totalRows
              )}
            />

            <InfoCard
              label="Usable Rows"
              value={
                missingChoiceRequired
                  ? "Waiting"
                  : String(
                      analysis.usableRows
                    )
              }
            />

            <InfoCard
              label="Removed Rows"
              value={
                missingChoiceRequired
                  ? "Waiting"
                  : String(
                      analysis.removedRows
                    )
              }
            />
          </div>

          {!missingChoiceRequired && (
            <div className="mt-5 space-y-3">
              {analysis.messages.map(
                (
                  message,
                  index
                ) => (
                  <MessageCard
                    key={`${message.title}-${index}`}
                    message={
                      message
                    }
                  />
                )
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {analysis.status !==
              "not-suitable" &&
              !missingChoiceRequired && (
                <button
                  type="button"
                  onClick={() =>
                    onUseDataset(
                      analysis.data,
                      feature,
                      target
                    )
                  }
                  className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-white"
                >
                  Use Prepared
                  Dataset in
                  Gradient
                  Descent
                </button>
              )}

            {usingUploadedDataset && (
              <button
                type="button"
                onClick={
                  onUseDemo
                }
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900"
              >
                Return to Demo
                Dataset
              </button>
            )}
          </div>
        </>
      )}

      <div className="mt-5 rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
        <p className="text-sm font-semibold text-blue-200">
          What is
          ModelMind
          checking?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          ModelMind checks
          whether the
          selected data can
          be prepared for
          this one-feature
          Gradient Descent
          regression
          visualization. It
          detects numerical
          and categorical X
          columns, missing
          values, scale and
          possible outliers.
          The Y target must
          remain numerical.
          This check does not
          claim that Gradient
          Descent or Linear
          Regression is the
          best model for the
          dataset.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 font-mono text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function MessageCard({
  message,
}: {
  message: Message;
}) {
  const classes =
    message.type ===
    "error"
      ? "border-red-900/60 bg-red-950/30"
      : message.type ===
          "warning"
        ? "border-amber-900/60 bg-amber-950/30"
        : "border-emerald-900/60 bg-emerald-950/30";

  const titleClass =
    message.type ===
    "error"
      ? "text-red-300"
      : message.type ===
          "warning"
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div
      className={`rounded-xl border p-4 ${classes}`}
    >
      <p
        className={`text-sm font-semibold ${titleClass}`}
      >
        {message.title}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {message.text}
      </p>
    </div>
  );
}