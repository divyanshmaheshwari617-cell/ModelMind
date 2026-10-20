"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Check,
  CreditCard,
  Crown,
  Database,
  FileText,
  Folder,
  Landmark,
  Lock,
  Map,
  Moon,
  PlayCircle,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import "./ModelMindPayment.css";

interface CheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutFailure {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  config: {
    display: {
      blocks: Record<
        string,
        { name: string; instruments: { method: PaymentMethod }[] }
      >;
      sequence: string[];
      preferences: { show_default_blocks: boolean };
    };
  };
  handler: (response: CheckoutResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: CheckoutFailure) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface PurchaseGateProps {
  userEmail: string;
  demoCouponCode: string | null;
}

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const navigation = [
  { label: "Home", icon: Brain },
  { label: "Roadmaps", icon: Map },
  { label: "Notebook", icon: BookOpen },
  { label: "Visualizations", icon: BarChart3 },
  { label: "VideoGPT", icon: PlayCircle },
];

const resources = [
  { label: "Datasets", icon: Database },
  { label: "Projects", icon: Folder },
  { label: "Community", icon: Users },
  { label: "Documentation", icon: FileText },
];

const features = [
  {
    title: "AI-Powered Learning Paths",
    description: "Personalized roadmaps based on your goals and skill level.",
    icon: Brain,
    tone: "purple",
  },
  {
    title: "Real-World Projects",
    description: "Build industry-ready projects and your portfolio.",
    icon: Rocket,
    tone: "orange",
  },
  {
    title: "Interactive Notebooks",
    description: "Run code, visualize data and experiment with ML models.",
    icon: BookOpen,
    tone: "green",
  },
  {
    title: "VideoGPT & AI Assistant",
    description: "Get instant explanations and step-by-step help with AI.",
    icon: PlayCircle,
    tone: "violet",
  },
  {
    title: "Active Community",
    description: "Learn, share and grow with like-minded learners.",
    icon: Users,
    tone: "pink",
  },
  {
    title: "Secure & Flexible Access",
    description: "Protected checkout for your ModelMind access.",
    icon: ShieldCheck,
    tone: "mint",
  },
];

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "(Google Pay, PhonePe, Paytm, etc.)",
    description: "Fast, secure and hassle-free payments",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    subtitle: "",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Net Banking",
    subtitle: "",
    description: "All major banks supported",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "Wallets",
    subtitle: "(Paytm, Amazon Pay, etc.)",
    description: "Quick and easy payment",
    icon: Wallet,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default function PurchaseGate({
  userEmail,
  demoCouponCode,
}: PurchaseGateProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState(demoCouponCode ?? "");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");

  function applyCoupon() {
    setError("");
    setCouponApplied(false);
    if (
      !demoCouponCode ||
      couponInput.trim().toUpperCase() !== demoCouponCode
    ) {
      setCouponMessage("That coupon code is not valid.");
      return;
    }
    setCouponApplied(true);
    setCouponMessage("100% free demo access applied.");
  }

  async function claimFreeAccess() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payment/redeem-coupon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ couponCode: couponInput }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          isRecord(payload) && typeof payload.error === "string"
            ? payload.error
            : "Could not activate free access. Please try again.";
        throw new Error(message);
      }
      window.location.replace("/");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not activate free access. Please try again.",
      );
      setBusy(false);
    }
  }

  async function startCheckout() {
    setBusy(true);
    setError("");
    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const orderPayload: unknown = await orderResponse.json();
      if (
        isRecord(orderPayload) &&
        orderPayload.code === "ALREADY_PAID"
      ) {
        window.location.replace("/");
        return;
      }
      if (
        !orderResponse.ok ||
        !isRecord(orderPayload) ||
        typeof orderPayload.keyId !== "string" ||
        typeof orderPayload.orderId !== "string" ||
        typeof orderPayload.amount !== "number" ||
        typeof orderPayload.currency !== "string"
      ) {
        const message =
          isRecord(orderPayload) && typeof orderPayload.error === "string"
            ? orderPayload.error
            : "Could not start checkout. Please try again.";
        throw new Error(message);
      }
      if (!window.Razorpay) {
        throw new Error("The secure checkout could not be loaded. Refresh and try again.");
      }

      const checkout = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.amount,
        currency: orderPayload.currency,
        name: "ModelMind",
        description: "One-time access to the ModelMind ML platform",
        order_id: orderPayload.orderId,
        prefill: { email: userEmail },
        theme: { color: "#7565ff" },
        config: {
          display: {
            blocks: {
              selected_method: {
                name: `Pay using ${paymentMethods.find((item) => item.id === paymentMethod)?.title ?? "UPI"}`,
                instruments: [{ method: paymentMethod }],
              },
            },
            sequence: ["block.selected_method"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (payment) => {
          try {
            const verificationResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payment),
            });
            const verificationPayload: unknown =
              await verificationResponse.json();
            if (!verificationResponse.ok) {
              const message =
                isRecord(verificationPayload) &&
                typeof verificationPayload.error === "string"
                  ? verificationPayload.error
                  : "Payment could not be verified. Contact support before retrying.";
              throw new Error(message);
            }
            window.location.replace("/");
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Payment could not be verified. Please try again.",
            );
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      checkout.on("payment.failed", (failure) => {
        setError(
          failure.error?.description ??
            "The payment did not complete. You can try again.",
        );
        setBusy(false);
      });
      checkout.open();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start checkout. Please try again.",
      );
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not sign out. Please try again.");
      }
      window.location.replace("/login");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not sign out.",
      );
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onError={() =>
          setError("The secure checkout could not be loaded. Refresh and try again.")
        }
      />
      <div className="mm-app">
        <aside className="mm-sidebar">
          <Link className="mm-logo" href="/purchase">
            <Brain size={34} strokeWidth={1.5} className="mm-logo-icon" />
            <span>Model<b>Mind</b></span>
          </Link>
          <nav className="mm-nav" aria-label="Main navigation">
            {navigation.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={`mm-nav-item ${index === 0 ? "active" : ""}`}
                aria-current={index === 0 ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={1.7} />
                {label}
              </div>
            ))}
          </nav>
          <div className="mm-divider" />
          <div className="mm-section-label">RESOURCES</div>
          <nav className="mm-nav" aria-label="Resources">
            {resources.map(({ label, icon: Icon }) => (
              <div className="mm-nav-item" key={label}>
                <Icon size={20} strokeWidth={1.7} />
                {label}
              </div>
            ))}
          </nav>
          <div className="mm-user">
            <div className="mm-avatar lg" aria-hidden="true">
              {userEmail[0]?.toUpperCase() ?? "M"}
            </div>
            <div className="mm-user-info">
              <div className="mm-user-name">{userEmail}</div>
              <div className="mm-user-role">ModelMind learner</div>
            </div>
            <button
              className="mm-signout"
              type="button"
              onClick={signOut}
              disabled={busy}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="mm-main">
          <header className="mm-topbar">
            <div className="mm-search">
              <Search size={18} />
              <input
                aria-label="Search ModelMind"
                placeholder="Search for topics, tools, datasets, notebooks..."
                disabled
              />
            </div>
            <div className="mm-top-actions" aria-hidden="true">
              <span className="mm-icon-btn"><Moon size={20} /></span>
              <span className="mm-icon-btn"><Bell size={20} /></span>
              <div className="mm-avatar">
                {userEmail[0]?.toUpperCase() ?? "M"}
              </div>
            </div>
          </header>

          <div className="mm-content">
            <section className="mm-left">
              <div className="mm-hero">
                <div className="mm-hero-text">
                  <span className="mm-badge">
                    <ShieldCheck size={15} /> SECURE &amp; SIMPLE PAYMENTS
                  </span>
                  <h1>
                    Power Your Learning<br />
                    with <span className="mm-gradient-text">ModelMind Pro</span>
                  </h1>
                  <p>
                    Unlock premium access to advanced notebooks, AI models,
                    real-world projects and more. Choose a payment method that
                    works best for you and get started securely.
                  </p>
                </div>
                <div className="mm-hero-art" aria-hidden="true">
                  <div className="mm-blob" />
                  <div className="mm-card-back" />
                  <div className="mm-card-front">
                    <Brain size={18} /> ModelMind
                  </div>
                </div>
              </div>

              <section className="mm-why" aria-labelledby="mm-why-heading">
                <h2 id="mm-why-heading">What Makes Our Project Different?</h2>
                <p className="mm-why-sub">
                  More than just a learning platform — ModelMind is built for
                  real learners, real projects and real-world skills.
                </p>
                <div className="mm-feature-grid">
                  {features.map(({ title, description, icon: Icon, tone }) => (
                    <article className="mm-feature" key={title}>
                      <div className={`mm-feature-icon ${tone}`}>
                        <Icon size={24} strokeWidth={1.6} />
                      </div>
                      <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mm-tagline">
                  Better Tools <ArrowRight size={14} /> Deeper Learning
                  <ArrowRight size={14} /> Bigger Dreams
                </div>
              </section>
            </section>

            <section className="mm-pay" aria-labelledby="mm-payment-heading">
              <Link className="mm-back" href="/login">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
              <div className="mm-secure">
                <Lock size={16} /> Secure Payment
              </div>
              <h2 id="mm-payment-heading">Complete Your Purchase</h2>
              <p className="mm-pay-sub">
                Choose a payment method to continue with your premium access.
              </p>

              <div className="mm-plan">
                <div className="mm-plan-icon"><Crown size={24} /></div>
                <div className="mm-plan-info">
                  <strong>
                    ModelMind Pro{demoCouponCode ? " – 1 Month" : " – Full Access"}
                  </strong>
                  <span>
                    Full access to features, notebooks, projects and more.
                  </span>
                </div>
                <div className="mm-plan-price">
                  <b>₹99</b>
                  <span>{demoCouponCode ? "/month demo" : "one-time"}</span>
                </div>
              </div>

              {demoCouponCode ? (
                <>
                  <label className="mm-label" htmlFor="mm-coupon">
                    Apply Coupon
                  </label>
                  <div className="mm-coupon">
                    <div className="mm-coupon-input">
                      <Tag size={18} />
                      <input
                        id="mm-coupon"
                        value={couponInput}
                        onChange={(event) => {
                          setCouponInput(event.target.value);
                          setCouponApplied(false);
                          setCouponMessage("");
                          setError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            applyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        autoComplete="off"
                        disabled={busy}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={busy}
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage ? (
                    <div
                      className={`mm-coupon-msg ${couponApplied ? "ok" : "err"}`}
                      role="status"
                    >
                      {couponMessage}
                    </div>
                  ) : null}
                  <div className="mm-price-breakdown" aria-live="polite">
                    <span>Original price</span><strong>₹99</strong>
                    <span>Discount</span>
                    <strong className={couponApplied ? "mm-discount" : ""}>
                      −₹{couponApplied ? "99" : "0"}
                    </strong>
                    <span className="mm-total-label">Total payable</span>
                    <strong className="mm-total">
                      ₹{couponApplied ? "0" : "99"}
                    </strong>
                  </div>
                </>
              ) : null}

              <div className="mm-label method">Choose a Payment Method</div>
              <div className="mm-methods" role="radiogroup" aria-label="Payment method">
                {paymentMethods.map(({ id, title, subtitle, description, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === id}
                    className={`mm-method ${paymentMethod === id ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(id)}
                    disabled={busy}
                  >
                    <span className="mm-method-icon"><Icon size={22} /></span>
                    <span className="mm-method-text">
                      <strong>
                        {title} {subtitle ? <span>{subtitle}</span> : null}
                      </strong>
                      <small>{description}</small>
                    </span>
                    <span className="mm-radio" aria-hidden="true" />
                  </button>
                ))}
              </div>

              {error ? <p className="mm-error" role="alert">{error}</p> : null}
              <button
                className="mm-pay-btn"
                type="button"
                onClick={couponApplied ? claimFreeAccess : startCheckout}
                disabled={busy}
              >
                {couponApplied ? <Check size={18} /> : <Lock size={18} />}
                {busy
                  ? couponApplied
                    ? "Activating free access…"
                    : "Opening secure checkout…"
                  : couponApplied
                    ? "Get one month free"
                    : `Pay ₹99 with ${paymentMethods.find((item) => item.id === paymentMethod)?.title ?? "UPI"}`}
                {!busy ? <ArrowRight size={18} /> : null}
              </button>
              <p className="mm-note">
                Your payment is securely processed by Razorpay. ModelMind
                doesn&apos;t store your card or UPI details.
              </p>
              <div className="mm-trust">
                <span><ShieldCheck size={16} /> Secure Payments</span>
                <i />
                <span><Lock size={16} /> SSL Encrypted</span>
                <i />
                <span><Users size={16} /> Trusted by Learners</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
