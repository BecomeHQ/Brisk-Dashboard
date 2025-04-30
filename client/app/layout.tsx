import React from "react";
import "./globals.css";
import type { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Leave Management Dashboard",
  description: "Employee leave management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
