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
  title: "CryptoVista - Real-Time Cryptocurrency Monitoring",
  description: "Monitor Bitcoin, Ethereum and Solana in real-time with interactive charts and instant data updates from Binance.",
  keywords: ["crypto", "bitcoin", "ethereum", "solana", "trading", "cryptocurrency", "real-time"],
  icons: {
    icon: "/transparentlogo.png",
    shortcut: "/transparentlogo.png",
    apple: "/transparentlogo.png",
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
