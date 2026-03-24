import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Mock Interview",
  description: "Single-session mock interview tool for business school applicants"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
