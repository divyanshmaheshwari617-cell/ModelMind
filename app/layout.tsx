import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelMind | Linear Regression Lab",
  description: "Interactive Linear Regression learning and visualization lab",
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