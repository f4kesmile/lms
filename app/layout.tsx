import { Suspense } from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppToaster } from "@/components/shared/AppToaster";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ChatbotVisibilityGuard } from "@/features/chat/ChatbotVisibilityGuard";
import { SITE_CONFIG } from "@/lib/constants";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
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
