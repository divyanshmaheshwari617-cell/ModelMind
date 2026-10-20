"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Could not sign out. Please try again.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not sign out. Please try again.",
      );
    }
  }

  return (
    <div className="signOutGroup">
      <button className="signOutButton" type="button" onClick={signOut}>
        Sign out
      </button>
      {error && <span className="signOutError" role="status">{error}</span>}
    </div>
  );
}
