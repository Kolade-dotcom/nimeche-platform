"use client";

import { ThemeProvider } from "next-themes";

/**
 * tokens.css themes on [data-theme] and falls back to prefers-color-scheme,
 * so next-themes is told to write that attribute rather than a class. The
 * three states the design plan commits to - light, dark, follow the system -
 * come from `themes` plus `enableSystem`.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
