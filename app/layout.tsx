import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NextAuthProvider from "@/components/NextAuthProvider";
import CookieNotice from "@/components/CookieNotice";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Op-Save-My-CGPA || Unilorin",
  description: "Operation save my CGPA",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ OneSignal SDK script */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
              OneSignal.init({
                appId: "89b8f066-8e83-476a-92e5-0a56b9e372fb",
                notifyButton: {
                  enable: true
                },
              });
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="savemycgpa-ui-theme"
          >
            <main>{children}</main>
            <Toaster />
            <CookieNotice />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}