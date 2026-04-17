"use client";

import { usePathname } from "next/navigation";

import { FloatingChatbot } from "@/features/chatbot/FloatingChatbot";

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forbidden",
  "/unauthorized",
];

const ALLOWED_EXACT_PATHS = ["/", "/about", "/help", "/chatbot"];
const ALLOWED_PREFIXES = ["/courses", "/materials", "/student", "/admin"];

export function ChatbotVisibilityGuard() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const isAllowedPath =
    ALLOWED_EXACT_PATHS.includes(pathname) ||
    ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowedPath) {
    return null;
  }

  return <FloatingChatbot />;
}
