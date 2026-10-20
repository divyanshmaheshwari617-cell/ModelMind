"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

const features = [
  ["▣", "Interactive Notebook", "Code, run and experiment in your Jupyter workspace.", "purple"],
  ["◉", "Model Visualizations", "Explore machine-learning models interactively.", "orange"],
  ["⌁", "Learning Roadmaps", "Follow a structured path from basics to advanced.", "teal"],
  ["▶", "VideoGPT", "Turn educational videos into learning material.", "pink"],
] as const;

type AuthMode = "signin" | "signup" | "reset";
type AuthFlow = "credentials" | "verify-code" | "set-password";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [flow, setFlow] = useState<AuthFlow>("credentials");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not verify that code.");
      }
      setFlow("set-password");
      setNotice(
        mode === "reset"
          ? "Your email is verified. Set a new password to continue."
          : "Your email is verified. Create a password for your account.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runRequest(path: string, body: object) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not send a verification code.");
      }
      return result;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed. Please try again.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await runRequest("/api/auth/request-code", { email });
    if (result) {
      setFlow("verify-code");
      setNotice(
        `If this address can be used, a code has been sent to ${email.trim()}.`,
      );
    }
  }

  async function resendCode() {
    const result = await runRequest("/api/auth/request-code", { email });
    if (result) {
      setNotice(`A new code has been sent to ${email.trim()}.`);
    }
  }

  function useDifferentEmail() {
    setFlow("credentials");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setNotice("");
  }

  async function signIn(forceSignOutOthers = false) {
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, forceSignOutOthers }),
      });
      const result = (await response.json()) as {
        code?: string;
        error?: string;
      };
      if (response.status === 409 && result.code === "ACTIVE_SESSION") {
        const confirmed = window.confirm(
          "This account is already signed in on another device. Sign out all other devices and continue here?",
        );
        if (confirmed) {
          await signIn(true);
        } else {
          setNotice("The other device remains signed in. You are still signed out here.");
        }
        return;
      }
      if (!response.ok) {
        throw new Error(result.error ?? "Could not sign in.");
      }
      window.location.replace("/");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed. Please try again.",
      );
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    await signIn();
    setBusy(false);
  }

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not save your password.");
      }
      await signIn();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save your password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function selectMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFlow("credentials");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setNotice("");
  }

  return (
    <main className="authPage">
      <div className="authBackdrop" aria-hidden="true" />
      <header className="authNav">
        <Link className="authBrand" href="/" aria-label="ModelMind home">
          <span className="authBrandMark" aria-hidden="true">
            <Image
              src="/modelmind-emblem-clear.png"
              alt=""
              width={1254}
              height={1254}
              priority
            />
          </span>
          <span>Model<span>Mind</span></span>
        </Link>
        <nav aria-label="Main navigation">
          <a className="active" href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#features">Notebook</a>
          <a href="#features">Visualizations</a>
          <a href="#features">Roadmaps</a>
          <a href="#features">VideoGPT</a>
        </nav>
        <span className="authThemeToggle" aria-hidden="true">☼</span>
      </header>

      <section className="authHero" id="home">
        <div className="authStory">
          <div className="authShowcase">
            <div className="authStoryCopy">
              <div className="authEyebrow"><span>✦</span> All-in-One ML Learning &amp; Building Platform</div>
              <h1>Turn Ideas into<br /><span>Intelligent Solutions</span></h1>
              <p className="authIntro">
                Learn, experiment, visualize and build real-world machine-learning
                projects — all in one place.
              </p>
              <div className="authStoryActions">
                <a href="#auth-card">Get Started <span aria-hidden="true">→</span></a>
                <a href="#features">Explore Features</a>
              </div>
            </div>
            <div className="authVisual" aria-hidden="true">
              <div className="authVisualGlow" />
              <div className="authCodeCard">
                <div className="authWindowDots"><i /><i /><i /></div>
                <div className="authCodeToolbar"><span>▷</span><span>↻</span><span>×</span></div>
                <p className="codeComment"># Train Model</p>
                <p><b>from</b> sklearn.ensemble <b>import</b> RandomForestClassifier</p>
                <p>model = RandomForestClassifier()</p>
                <p>model.fit(X_train, y_train)</p>
                <div className="authChart">
                  <span /><span /><span /><span /><span /><span /><span />
                  <svg viewBox="0 0 200 72">
                    <path d="M4 57 C25 52 30 19 50 30 S78 62 98 38 S127 12 146 26 S171 51 196 13" />
                    <path d="M4 60 C29 57 36 42 55 48 S82 18 101 33 S135 54 153 35 S179 24 196 29" />
                  </svg>
                </div>
              </div>
              <div className="authOrbit authOrbitOne">⌘</div>
              <div className="authOrbit authOrbitTwo">▥</div>
              <div className="authOrbit authOrbitThree">♧</div>
              <div className="authOrbit authOrbitFour">✿</div>
              <div className="authStageBase" />
            </div>
          </div>
          <div className="authFeatureGrid" id="features">
            {features.map(([icon, name, description, color]) => (
              <article className="authFeature" key={name}>
                <span className={`authFeatureIcon ${color}`}>{icon}</span>
                <div><h2>{name}</h2><p>{description}</p></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="authCard" id="auth-card">
          <div className="authCardLogo">
            <span className="authBrandMark" aria-hidden="true">
              <Image
                src="/modelmind-emblem-clear.png"
                alt=""
                width={1254}
                height={1254}
              />
            </span>
            <span>Model<span>Mind</span></span>
          </div>
          <div className="authHeading">
            <h2>
              {flow === "verify-code"
                ? "Check your email"
                : flow === "set-password"
                  ? mode === "reset"
                    ? "Set a new password"
                    : "Create your password"
                  : mode === "signin"
                    ? "Welcome back"
                    : mode === "reset"
                      ? "Reset your password"
                      : "Create your account"}
            </h2>
            <p>
              {flow === "verify-code"
                ? `Enter the six-digit code sent to ${email}.`
                : flow === "set-password"
                  ? "Use at least 8 characters. Your password is stored securely as a one-way hash."
                  : mode === "signin"
                    ? "Sign in with your email and password."
                    : mode === "reset"
                      ? "Verify your email to reset your password."
                      : "Verify your email, then choose a password to finish signing up."}
            </p>
          </div>

          {notice && <div className="authNotice success" role="status">{notice}</div>}
          {error && <div className="authNotice error" role="alert">{error}</div>}

          {flow === "credentials" && mode !== "reset" && (
            <div className="authTabs" role="tablist" aria-label="Account access">
              <button
                className={mode === "signin" ? "selected" : ""}
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => selectMode("signin")}
              >
                Sign in
              </button>
              <button
                className={mode === "signup" ? "selected" : ""}
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => selectMode("signup")}
              >
                Create account
              </button>
            </div>
          )}
          {flow === "credentials" && mode === "reset" && (
            <button
              className="authTextAction"
              type="button"
              onClick={() => selectMode("signin")}
            >
              Back to sign in
            </button>
          )}

          {flow === "credentials" && mode === "signin" ? (
            <form className="authForm" onSubmit={handleSignIn}>
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <label htmlFor="auth-password">Password</label>
              <div className="authPasswordInput">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button className="authSubmit" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}<span>→</span>
              </button>
              <button
                className="authTextAction"
                type="button"
                onClick={() => selectMode("reset")}
              >
                Forgot password?
              </button>
            </form>
          ) : flow === "credentials" ? (
            <form className="authForm" onSubmit={handleSendCode}>
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <p className="authFinePrint">
                We’ll send a one-time code to verify that you own this email.
              </p>
              <button className="authSubmit" type="submit" disabled={busy}>
                {busy ? "Sending code…" : "Send verification code"}<span>→</span>
              </button>
            </form>
          ) : flow === "verify-code" ? (
            <form className="authForm" onSubmit={verifyCode}>
              <label htmlFor="email-otp">Six-digit email code</label>
              <input
                id="email-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter your code"
              />
              <button className="authSubmit" type="submit" disabled={busy || otp.length !== 6}>
                {busy ? "Verifying…" : "Verify and continue"}<span>→</span>
              </button>
              <button className="authTextAction" type="button" onClick={resendCode} disabled={busy}>
                Resend code
              </button>
              <button className="authTextAction" type="button" onClick={useDifferentEmail} disabled={busy}>
                Use a different email
              </button>
            </form>
          ) : (
            <form className="authForm" onSubmit={handleSetPassword}>
              <label htmlFor="new-password">Password</label>
              <div className="authPasswordInput">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="authPasswordInput">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-pressed={showConfirmPassword}
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button className="authSubmit" type="submit" disabled={busy}>
                {busy ? "Saving password…" : "Save password"}<span>→</span>
              </button>
              <button
                className="authTextAction"
                type="button"
                onClick={useDifferentEmail}
                disabled={busy}
              >
                Use a different email
              </button>
            </form>
          )}
          <p className="authPrivacy">
            Codes expire after 10 minutes. Passwords are stored as secure
            one-way hashes, never in plain text.
          </p>
        </aside>
      </section>
    </main>
  );
}
