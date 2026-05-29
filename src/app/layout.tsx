import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/language-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Victus Training School",
  description: "Navvi × Victus sewing operator training school pilot scaffold.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
