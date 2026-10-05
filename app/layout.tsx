import "../components/roadmap/roadmap.css";
import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

export const metadata: Metadata = {
  title: "ModelMind Personalized Roadmap",
  description:
    "Personalized machine learning roadmap powered by ModelMind.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}