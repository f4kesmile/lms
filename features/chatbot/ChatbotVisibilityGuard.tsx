"use client";

import { usePathname } from "next/navigation";
import { FloatingChatbot } from "@/features/chatbot/FloatingChatbot";

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/admin",
  "/forbidden",
  "/unauthorized",
];

export function ChatbotVisibilityGuard() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return <FloatingChatbot />;
}
