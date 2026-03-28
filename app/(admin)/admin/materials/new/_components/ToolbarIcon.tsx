import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ToolbarIconProps = {
  title: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
};

export function ToolbarIcon({
  title,
  onClick,
  children,
  active,
}: ToolbarIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          title={title}
          onClick={onClick}
          className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-foreground transition-colors hover:bg-muted ${
            active
              ? "bg-muted/70 text-primary ring-1 ring-inset ring-border"
              : ""
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}
