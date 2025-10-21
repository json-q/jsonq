import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import PageFooter from "@/components/layouts/page-footer";
import PageHeader from "@/components/layouts/page-header";
import siteConfig from "@/config/siteConfig";
import "./globals.css";

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" enableSystem enableColorScheme disableTransitionOnChange>
          <PageHeader />
          <main className="container-wrapper">{children}</main>
          <PageFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
