import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelMind | Boosting Lab",
  description:
    "Interactive AdaBoost and Gradient Boosting Learning Laboratory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080d19] text-white">
        {children}
      </body>
    </html>
  );
}