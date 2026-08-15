import type { Metadata } from "next";

import { ThemeProvider } from "@/components/themes/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | Administration",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-dvh bg-[var(--background)]">{children}</div>
    </ThemeProvider>
  );
}
