"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      expand
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        duration: 2600,
      }}
    />
  );
}
