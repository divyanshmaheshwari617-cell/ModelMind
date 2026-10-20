import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelMind | Machine Learning Workspace",
  description:
    "Follow your ML roadmap, build notebooks, explore interactive visualizations, and learn from videos.",
  icons: {
    icon: "/modelmind-emblem-clear.png",
    apple: "/modelmind-emblem-clear.png",
  },
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