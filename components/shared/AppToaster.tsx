"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      closeButton
      expand
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        duration: 2600,
        classNames: {
          toast: "border shadow-md",
          default: "bg-card text-foreground border-border",
          title: "font-semibold",
          description: "text-sm text-foreground/90",
          closeButton:
            "border border-border/80 bg-background/85 text-foreground/90 hover:bg-background hover:text-foreground",
          success: "!bg-primary !text-primary-foreground !border-primary",
          error:
            "!bg-destructive !text-destructive-foreground !border-destructive",
          warning: "!bg-amber-500 !text-black !border-amber-600",
          info: "!bg-secondary-brand !text-on-inverse !border-secondary-brand",
        },
      }}
    />
  );
}
