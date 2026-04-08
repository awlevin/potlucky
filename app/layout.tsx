import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Box, ChakraProvider } from '@chakra-ui/react'
import { Providers } from "./providers";

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
          <Box pt={16} minH="100vh" bg="bg.canvas">

          {children}
          </Box>
          </Providers>
      </body>
    </html>
  );
}
