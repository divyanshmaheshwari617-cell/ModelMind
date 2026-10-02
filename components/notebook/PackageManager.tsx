"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getInstalledPackages,
  installRuntimePackage,
  InstalledPackage,
} from "@/lib/api";


interface Props {
  runtimeId: string | null;
  runtimeReady: boolean;
}


export default function PackageManager({
  runtimeId,
  runtimeReady,
}: Props) {
  const [packageName, setPackageName] =
    useState("");

  const [version, setVersion] =
    useState("");

  const [packages, setPackages] =
    useState<InstalledPackage[]>([]);

  const [loadingPackages, setLoadingPackages] =
    useState(false);

  const [installing, setInstalling] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showInstalled, setShowInstalled] =
    useState(false);


  const loadPackages = useCallback(
    async () => {
      if (!runtimeId || !runtimeReady) {
        setPackages([]);
        return;
      }

      setLoadingPackages(true);
      setError("");

      try {
        const result =
          await getInstalledPackages(
            runtimeId
          );

        setPackages(result.packages);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load packages."
        );
      } finally {
        setLoadingPackages(false);
      }
    },
    [runtimeId, runtimeReady]
  );


  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);


  const filteredPackages =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return packages;
      }

      return packages.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(query)
      );
    }, [packages, search]);


  async function handleInstall() {
    if (!runtimeId || !runtimeReady) {
      setError(
        "ModelMind runtime is not ready."
      );
      return;
    }

    const requestedPackage =
      packageName.trim();

    if (!requestedPackage) {
      setError(
        "Enter a package name first."
      );
      return;
    }

    setInstalling(true);
    setError("");
    setMessage(
      `Installing ${requestedPackage}...`
    );

    try {
      const result =
        await installRuntimePackage(
          runtimeId,
          requestedPackage,
          version.trim() || undefined
        );

      const installedVersion =
        result.version
          ? ` ${result.version}`
          : "";

      setMessage(
        `✓ ${result.package}${installedVersion} installed successfully.`
      );

      setPackageName("");
      setVersion("");

      await loadPackages();

      window.dispatchEvent(
        new CustomEvent(
          "modelmind-package-installed",
          {
            detail: {
              package: result.package,
              version: result.version,
            },
          }
        )
      );
    } catch (requestError) {
      setMessage("");

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Package installation failed."
      );
    } finally {
      setInstalling(false);
    }
  }


  return (
    <div
      style={{
        margin: "14px 20px",
        border:
          "1px solid rgba(255,255,255,0.10)",
        borderRadius: "14px",
        background:
          "rgba(255,255,255,0.035)",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: "16px 18px",
          borderBottom:
            "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Package Manager
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "12px",
              opacity: 0.65,
            }}
          >
            Install Python libraries for
            this ModelMind environment.
          </div>
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.75,
          }}
        >
          {runtimeReady
            ? `${packages.length} installed`
            : "Runtime unavailable"}
        </div>
      </div>


      {/* INSTALL */}

      <div
        style={{
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 1fr) 130px auto",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            value={packageName}
            onChange={(event) =>
              setPackageName(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !installing
              ) {
                void handleInstall();
              }
            }}
            placeholder="Package name, e.g. opencv-python"
            disabled={
              !runtimeReady ||
              installing
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(0,0,0,0.18)",
              color: "inherit",
              outline: "none",
            }}
          />

          <input
            value={version}
            onChange={(event) =>
              setVersion(
                event.target.value
              )
            }
            placeholder="Version (optional)"
            disabled={
              !runtimeReady ||
              installing
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(0,0,0,0.18)",
              color: "inherit",
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={() =>
              void handleInstall()
            }
            disabled={
              !runtimeReady ||
              installing ||
              !packageName.trim()
            }
            style={{
              padding: "10px 16px",
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
              whiteSpace: "nowrap",
              opacity:
                !runtimeReady ||
                installing ||
                !packageName.trim()
                  ? 0.5
                  : 1,
            }}
          >
            {installing
              ? "Installing..."
              : "Install"}
          </button>
        </div>


        {/* STATUS */}

        {message && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              background:
                "rgba(114,226,138,0.08)",
              border:
                "1px solid rgba(114,226,138,0.20)",
              fontSize: "13px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              background:
                "rgba(255,114,114,0.08)",
              border:
                "1px solid rgba(255,114,114,0.22)",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </div>
        )}


        {/* INSTALLED PACKAGES */}

        <div
          style={{
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowInstalled(
                (current) => !current
              )
            }
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {showInstalled
              ? "▾"
              : "▸"}{" "}
            Installed packages
            {loadingPackages
              ? " · loading..."
              : ` · ${packages.length}`}
          </button>


          {showInstalled && (
            <div
              style={{
                marginTop: "12px",
              }}
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search installed packages..."
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "rgba(0,0,0,0.16)",
                  color: "inherit",
                  outline: "none",
                  marginBottom: "10px",
                }}
              />

              <div
                style={{
                  maxHeight: "240px",
                  overflowY: "auto",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "9px",
                }}
              >
                {filteredPackages.length ===
                0 ? (
                  <div
                    style={{
                      padding: "14px",
                      fontSize: "13px",
                      opacity: 0.65,
                    }}
                  >
                    No matching packages.
                  </div>
                ) : (
                  filteredPackages.map(
                    (item) => (
                      <div
                        key={`${item.name}-${item.version}`}
                        style={{
                          padding:
                            "9px 12px",
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "16px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                          fontSize:
                            "13px",
                        }}
                      >
                        <span>
                          ✓ {item.name}
                        </span>

                        <span
                          style={{
                            opacity: 0.6,
                          }}
                        >
                          {item.version}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadPackages()
                }
                disabled={
                  loadingPackages
                }
                style={{
                  marginTop: "10px",
                  padding: "7px 11px",
                  borderRadius: "7px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "rgba(255,255,255,0.04)",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                {loadingPackages
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}