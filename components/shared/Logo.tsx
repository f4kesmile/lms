"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ className, size = "md", withText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const maskHoleSize = {
    sm: "25%",
    md: "35%",
    lg: "40%",
  };

  return (
    <Link href="/" className={cn("flex items-center gap-5", className)}>
      <div 
        className={cn(
          "relative flex items-center justify-center bg-current shadow-md transition-transform hover:scale-110 rotate-45 rounded-sm md:rounded-md",
          sizeClasses[size]
        )}
        style={{
          WebkitMaskImage: `linear-gradient(#000 0 0), linear-gradient(#000 0 0)`,
          WebkitMaskComposite: "xor",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: `100% 100%, ${maskHoleSize[size]} ${maskHoleSize[size]}`,
          maskImage: `linear-gradient(#000 0 0), linear-gradient(#000 0 0)`,
          maskComposite: "exclude",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: `100% 100%, ${maskHoleSize[size]} ${maskHoleSize[size]}`,
        }}
      />
      {withText && (
        <span className={cn("font-black tracking-tighter", textClasses[size], !className?.includes("text-") && "text-foreground")}>
          {SITE_CONFIG.shortName}
          <span className="ml-2 font-light text-muted-foreground">
            {SITE_CONFIG.accentName}
          </span>
        </span>
      )}
    </Link>
  );
}
