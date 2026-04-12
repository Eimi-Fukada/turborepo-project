import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientRoot from "./clientRoot";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "苏州康养集团",
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
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
