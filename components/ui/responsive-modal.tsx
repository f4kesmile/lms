"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mobileContentClassName?: string;
  mobileBodyClassName?: string;
  desktopMaxWidth?: string; // e.g., "max-w-xl", "max-w-4xl"
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  mobileContentClassName,
  mobileBodyClassName,
  desktopMaxWidth = "max-w-md",
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(desktopMaxWidth, className)}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "max-h-[92dvh] border-none rounded-t-3xl overflow-hidden bg-background p-0",
          mobileContentClassName,
        )}
      >
        {(title || description) && (
          <DrawerHeader className="text-left border-b border-border/40 bg-card/30 px-4 py-4">
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div
          className={cn("overflow-y-auto px-4 pb-6 pt-3", mobileBodyClassName)}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
