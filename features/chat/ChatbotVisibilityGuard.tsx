"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { FloatingChatbot } from "@/features/chatbot/FloatingChatbot";

const HIDDEN_PREFIXES = ["/login", "/register", "/forbidden", "/unauthorized"];

const ALLOWED_EXACT_PATHS = ["/", "/about", "/help", "/chatbot"];
const ALLOWED_PREFIXES = ["/courses", "/materials", "/student", "/admin"];

export function ChatbotVisibilityGuard() {
  const pathname = usePathname();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    const readOverlayState = () => {
      const openOverlay = document.querySelector(
        "[data-chatbot-overlay='true'][data-state='open']",
      );
      setIsOverlayOpen((prev) => {
        const next = Boolean(openOverlay);
        return prev === next ? prev : next;
      });
    };

    readOverlayState();

    const onOverlayChange = () => {
      readOverlayState();
    };

    window.addEventListener("chatbot-overlay-change", onOverlayChange);
    return () => {
      window.removeEventListener("chatbot-overlay-change", onOverlayChange);
    };
  }, []);

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

  if (isOverlayOpen) {
    return null;
  }

  return <FloatingChatbot />;
}
