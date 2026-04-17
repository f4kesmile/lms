import "./globals.css";

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Suspense } from "react";

import { AppToaster } from "@/components/shared/AppToaster";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatbotVisibilityGuard } from "@/features/chat/ChatbotVisibilityGuard";
import { SITE_CONFIG } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
  description: SITE_CONFIG.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: "/",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
    creator: "@nusabelajar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={spaceGrotesk.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <AppToaster />
            <Suspense fallback={null}>
              <ChatbotVisibilityGuard />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
