import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MyBaseLayout from "./providers/base-layout";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "苏康养",
  description: "您的生活管家平台",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MyBaseLayout>{children}</MyBaseLayout>
      </body>
    </html>
  );
}
