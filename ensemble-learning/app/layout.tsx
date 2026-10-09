
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelMind | Ensemble Learning Lab",
  description:
    "Interactive ensemble machine learning laboratory with visualizations, model comparisons, datasets, and hyperparameter exploration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
