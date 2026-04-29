import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MyBaseLayout from "./providers/base-layout";
import Script from "next/script";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Turborepo",
  description: "Turborepo 管理的项目集",
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />

        {/* 控制台 */}
        <Script
          strategy="afterInteractive"
          src="https://cdn.jsdelivr.net/npm/eruda"
        />
        <Script
          strategy="afterInteractive"
          id="eruda-init"
          dangerouslySetInnerHTML={{
            __html: `
              function initEruda() {
                if (typeof eruda !== 'undefined') {
                  eruda.init();
                } else {
                  setTimeout(initEruda, 100);
                }
              }
              initEruda();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MyBaseLayout>{children}</MyBaseLayout>
      </body>
    </html>
  );
}
