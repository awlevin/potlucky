import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Box } from '@chakra-ui/react'
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
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
