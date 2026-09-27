import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelMind",
  description: "Understand, visualize and build machine learning.",
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