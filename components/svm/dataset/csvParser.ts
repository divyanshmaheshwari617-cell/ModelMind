import Papa from "papaparse";

import type {
  RawDatasetRow,
} from "./defaultDatasets";

export type CSVParseResult = {
  rows: RawDatasetRow[];
  columns: string[];
  errors: string[];
};

export function parseCSVFile(
  file: File
): Promise<CSVParseResult> {
  return new Promise(
    (resolve, reject) => {
      Papa.parse<
        Record<
          string,
          string
        >
      >(file, {
        header: true,

        skipEmptyLines: true,

        dynamicTyping: true,

        complete: (
          result
        ) => {
          const errors =
            result.errors.map(
              (error) =>
                `Row ${
                  error.row ?? "?"
                }: ${
                  error.message
                }`
            );

          const rows =
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
                    String(
                      value
                    ).trim() !==
                      ""
                )
            ) as RawDatasetRow[];

          const columns =
            result.meta.fields ??
            [];

          resolve({
            rows,
            columns,
            errors,
          });
        },

        error: (error) => {
          reject(error);
        },
      });
    }
  );
}