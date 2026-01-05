import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "System Design Interview",
  description: "Practice system design interviews with AI-powered feedback and diagram analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231e293b' width='100' height='100'/><g fill='%233b82f6'><circle cx='30' cy='30' r='8'/><circle cx='70' cy='30' r='8'/><circle cx='50' cy='70' r='8'/><line x1='30' y1='30' x2='50' y2='70' stroke='%233b82f6' stroke-width='2'/><line x1='70' y1='30' x2='50' y2='70' stroke='%233b82f6' stroke-width='2'/></g></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
