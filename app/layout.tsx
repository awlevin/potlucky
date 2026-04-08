import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { Box } from '@chakra-ui/react'
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Potlucky — The Friendliest Way to Plan a Potluck",
  description: "Organize your potluck in seconds. Add friends, claim dishes, and feast together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <Providers>
          <Box minH="100vh" display="flex" flexDirection="column" bg="bg.canvas">
            <Navbar />
            <Box flex="1">
              {children}
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
