import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "HolidayGO · 中国假期政策查询",
    template: "%s · HolidayGO",
  },
  description:
    "面向中国大陆居民的假期政策查询：年休、婚、产、陪产、育儿、探亲、病假，覆盖中央法规与省级特别规定。",
  keywords: ["假期", "年休假", "产假", "陪产假", "育儿假", "婚假", "探亲假", "病假", "中国"],
  authors: [{ name: "HolidayGO-CN" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1 container py-6 md:py-10">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
