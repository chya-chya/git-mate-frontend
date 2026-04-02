import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Git-Mate | AI-Powered GitHub Analysis",
  description: "Analyze your GitHub communication and performance with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-indigo-100 dark:selection:bg-indigo-900`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 transition-all duration-300 md:pl-64">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
