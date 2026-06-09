import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Git-Mate | AI 기반 GitHub 협업 역량 진단 도구",
  description: "GitHub 커밋과 코드 리뷰 텍스트를 AI로 분석하여 당신의 소통 스타일, 협업 능력, 5대 개발자 역량을 시각화된 레이더 차트 카드로 진단해 보세요.",
  keywords: ["Git-Mate", "깃메이트", "개발자 역량 분석", "GitHub 분석", "코드 리뷰", "협업 도구", "소프트 스킬"],
  authors: [{ name: "Git-Mate Team" }],
  openGraph: {
    title: "Git-Mate | AI 기반 GitHub 협업 역량 진단 도구",
    description: "GitHub 커밋과 코드 리뷰 텍스트를 AI로 분석하여 당신의 소통 스타일, 협업 능력, 5대 개발자 역량을 시각화된 레이더 차트 카드로 진단해 보세요.",
    url: "https://git-mate-frontend-pqs3.vercel.app",
    siteName: "Git-Mate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Git-Mate 서비스 소개 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Git-Mate | AI 기반 GitHub 협업 역량 진단 도구",
    description: "GitHub 커밋과 코드 리뷰 텍스트를 AI로 분석하여 당신의 소통 스타일, 협업 능력, 5대 개발자 역량을 시각화된 레이더 차트 카드로 진단해 보세요.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
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
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
