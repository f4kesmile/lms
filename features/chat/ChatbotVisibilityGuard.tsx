"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { FloatingChatbot } from "@/features/chatbot/FloatingChatbot";

const HIDDEN_PREFIXES = ["/login", "/register", "/forbidden", "/unauthorized"];

const ALLOWED_EXACT_PATHS = ["/", "/about", "/help", "/chatbot"];
const ALLOWED_PREFIXES = ["/courses", "/materials", "/student", "/admin"];

export function ChatbotVisibilityGuard() {
  const pathname = usePathname();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const readOverlayState = useCallback(() => {
    const openOverlay = document.querySelector(
      "[data-chatbot-overlay='true'][data-state='open'], [data-chatbot-overlay='true']:not([data-state='closed'])",
    );

    setIsOverlayOpen((prev) => {
      const next = Boolean(openOverlay);
      return prev === next ? prev : next;
    });
  }, []);

  useEffect(() => {
    readOverlayState();

    const onOverlayChange = () => {
      // Wait one frame so DOM `data-state` settles before reading.
      requestAnimationFrame(readOverlayState);
    };

    const onViewportChange = () => {
      readOverlayState();
    };

    const onWindowFocus = () => {
      readOverlayState();
    };

    window.addEventListener("chatbot-overlay-change", onOverlayChange);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onViewportChange);

    return () => {
      window.removeEventListener("chatbot-overlay-change", onOverlayChange);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onViewportChange);
    };
  }, [readOverlayState]);

  useEffect(() => {
    // Route transitions can unmount overlays without emitting close events.
    readOverlayState();
  }, [pathname, readOverlayState]);

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
