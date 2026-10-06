import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gradient Descent Lab | ModelMind",
  description:
    "Interactive Gradient Descent learning and visualization lab by ModelMind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}