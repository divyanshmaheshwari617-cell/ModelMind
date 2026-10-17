import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AdaBoost Lab · ModelMind", description: "Interactive AdaBoost classification and regression laboratory" };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
