import type { Route } from "next";
import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actionText?: string;
  actionHref?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  actionHref,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col md:flex-row md:items-end justify-between gap-4 py-8",
        align === "center" && "text-center md:flex-col md:items-center",
        align === "right" && "text-right md:flex-row-reverse",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-black text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground max-w-2xl text-[0.95rem]">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref as Route}
          className="btn-ghost shrink-0 border border-border px-4 py-2 text-[0.9rem] font-bold hover:bg-muted"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
