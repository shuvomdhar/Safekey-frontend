import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Safekey — every password in one quiet place",
    template: "%s · Safekey"
  },
  description:
    "Safekey is a calm, flexible password and secret manager. Create a vault for every site, design your own columns, and keep every account in one safe place.",
  applicationName: "Safekey",
  keywords: ["password manager", "secrets", "vault", "passwords", "security"]
};

export const viewport: Viewport = {
  themeColor: "#FAF7EE",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-sans text-ink">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
