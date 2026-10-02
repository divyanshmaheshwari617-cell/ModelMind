"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getPackageStatus,
  installRuntimePackage,
  PackageStatus,
} from "@/lib/api";


interface Props {
  runtimeId: string | null;

  runtimeReady: boolean;

  traceback: string;

  onInstalled?: (
    packageName: string
  ) => void;

  onRunAgain?: () => void;
}


function extractMissingImport(
  traceback: string
): string | null {
  const match = traceback.match(
    /No module named ['"]([^'"]+)['"]/
  );

  if (!match) {
    return null;
  }

  const fullImport =
    match[1].trim();

  if (!fullImport) {
    return null;
  }

  return fullImport.split(".")[0];
}


export default function MissingPackageAssistant({
  runtimeId,
  runtimeReady,
  traceback,
  onInstalled,
  onRunAgain,
}: Props) {
  const missingImport =
    extractMissingImport(traceback);

  const [
    status,
    setStatus,
  ] = useState<PackageStatus | null>(
    null
  );

  const [
    checking,
    setChecking,
  ] = useState(false);

  const [
    installing,
    setInstalling,
  ] = useState(false);

  const [
    installed,
    setInstalled,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function checkPackage() {
      setStatus(null);
      setInstalled(false);
      setError("");

      if (
        !missingImport ||
        !runtimeId ||
        !runtimeReady
      ) {
        return;
      }

      setChecking(true);

      try {
        const result =
          await getPackageStatus(
            runtimeId,
            missingImport
          );

        if (!cancelled) {
          setStatus(result);

          if (
            result.verified &&
            result.installed
          ) {
            setInstalled(true);
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not identify the package."
          );
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    void checkPackage();

    return () => {
      cancelled = true;
    };
  }, [
    missingImport,
    runtimeId,
    runtimeReady,
  ]);


  async function handleInstall() {
    if (
      !runtimeId ||
      !runtimeReady ||
      !status ||
      !status.verified ||
      !status.package_name
    ) {
      return;
    }

    const packageName =
      status.package_name;

    setInstalling(true);
    setError("");

    try {
      const result =
        await installRuntimePackage(
          runtimeId,
          packageName
        );

      setInstalled(true);

      setStatus((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          installed: true,
          version:
            result.version ??
            current.version,
        };
      });

      window.dispatchEvent(
        new CustomEvent(
          "modelmind-package-installed",
          {
            detail: {
              importName:
                status.import_name,

              package:
                packageName,

              version:
                result.version,
            },
          }
        )
      );

      onInstalled?.(
        packageName
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Package installation failed."
      );
    } finally {
      setInstalling(false);
    }
  }


  if (!missingImport) {
    return null;
  }


  return (
    <div
      style={{
        marginTop: "12px",

        padding: "14px",

        borderRadius: "10px",

        border:
          "1px solid rgba(125,170,255,0.28)",

        background:
          "rgba(80,120,255,0.07)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",

          alignItems: "center",

          gap: "8px",

          fontSize: "14px",

          fontWeight: 700,
        }}
      >
        <span>📦</span>

        <span>
          Missing Python Library
        </span>
      </div>


      {/* IMPORT */}

      <div
        style={{
          marginTop: "10px",

          fontSize: "13px",

          lineHeight: 1.6,
        }}
      >
        Your code imports:

        <code
          style={{
            marginLeft: "7px",

            padding: "2px 6px",

            borderRadius: "5px",

            background:
              "rgba(255,255,255,0.07)",
          }}
        >
          {missingImport}
        </code>
      </div>


      {/* CHECKING */}

      {checking && (
        <div
          style={{
            marginTop: "10px",

            fontSize: "12px",

            opacity: 0.7,
          }}
        >
          ModelMind is identifying the
          required package...
        </div>
      )}


      {/* VERIFIED PACKAGE */}

      {status &&
        status.verified &&
        status.package_name && (
          <>
            <div
              style={{
                marginTop: "10px",

                fontSize: "13px",

                lineHeight: 1.6,
              }}
            >
              ModelMind identified the
              verified package:

              <code
                style={{
                  marginLeft: "7px",

                  padding: "2px 6px",

                  borderRadius: "5px",

                  background:
                    "rgba(255,255,255,0.07)",
                }}
              >
                {status.package_name}
              </code>
            </div>


            <div
              style={{
                marginTop: "6px",

                fontSize: "11px",

                opacity: 0.55,
              }}
            >
              ✓ Verified ModelMind
              package mapping
            </div>


            {!installed && (
              <button
                type="button"

                onClick={() =>
                  void handleInstall()
                }

                disabled={
                  installing ||
                  !runtimeReady
                }

                style={{
                  marginTop: "12px",

                  padding:
                    "9px 13px",

                  borderRadius: "8px",

                  border:
                    "1px solid rgba(114,226,138,0.35)",

                  background:
                    "rgba(114,226,138,0.12)",

                  color: "inherit",

                  cursor:
                    installing
                      ? "wait"
                      : "pointer",

                  fontSize: "13px",

                  fontWeight: 600,

                  opacity:
                    installing
                      ? 0.65
                      : 1,
                }}
              >
                {installing
                  ? `Installing ${status.package_name}...`
                  : `Install ${status.package_name}`}
              </button>
            )}


            {installed && (
              <div
                style={{
                  marginTop: "12px",

                  padding: "10px",

                  borderRadius: "8px",

                  border:
                    "1px solid rgba(114,226,138,0.22)",

                  background:
                    "rgba(114,226,138,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",

                    fontWeight: 600,
                  }}
                >
                  ✓ Package installed
                </div>


                {status.version && (
                  <div
                    style={{
                      marginTop: "4px",

                      fontSize: "12px",

                      opacity: 0.7,
                    }}
                  >
                    {status.package_name}{" "}
                    {status.version}
                  </div>
                )}


                {onRunAgain && (
                  <button
                    type="button"

                    onClick={
                      onRunAgain
                    }

                    style={{
                      marginTop:
                        "10px",

                      padding:
                        "8px 12px",

                      borderRadius:
                        "7px",

                      border:
                        "1px solid rgba(255,255,255,0.12)",

                      background:
                        "rgba(255,255,255,0.06)",

                      color:
                        "inherit",

                      cursor:
                        "pointer",

                      fontSize:
                        "12px",
                    }}
                  >
                    ▶ Run Cell Again
                  </button>
                )}
              </div>
            )}
          </>
        )}


      {/* UNKNOWN / UNVERIFIED IMPORT */}

      {status &&
        !status.verified && (
          <div
            style={{
              marginTop: "12px",

              padding: "11px",

              borderRadius: "8px",

              border:
                "1px solid rgba(255,190,90,0.24)",

              background:
                "rgba(255,190,90,0.07)",
            }}
          >
            <div
              style={{
                fontSize: "13px",

                fontWeight: 600,
              }}
            >
              Package not confidently
              identified
            </div>

            <div
              style={{
                marginTop: "6px",

                fontSize: "12px",

                lineHeight: 1.6,

                opacity: 0.8,
              }}
            >
              ModelMind does not have a
              verified package mapping
              for{" "}

              <code>
                {status.import_name}
              </code>

              . It will not guess or
              automatically install an
              unknown package.
            </div>

            <div
              style={{
                marginTop: "8px",

                fontSize: "12px",

                opacity: 0.7,
              }}
            >
              If you know the correct
              PyPI package, install it
              manually using the
              Package Manager above.
            </div>
          </div>
        )}


      {/* REQUEST ERROR */}

      {error && (
        <div
          style={{
            marginTop: "10px",

            padding: "9px",

            borderRadius: "7px",

            border:
              "1px solid rgba(255,110,110,0.22)",

            background:
              "rgba(255,110,110,0.07)",

            fontSize: "12px",

            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      )}


      {/* SAFETY */}

      <div
        style={{
          marginTop: "10px",

          fontSize: "11px",

          opacity: 0.55,
        }}
      >
        ModelMind will never install a
        package without your permission.
      </div>
    </div>
  );
}