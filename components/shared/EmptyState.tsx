import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/index";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ElementType | (() => ReactNode);
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      ) : null}
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
