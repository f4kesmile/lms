import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export interface StatBoxProps {
  label: string;
  value: ReactNode;
  icon?: string;
  className?: string;
}

export function StatBox({ label, value, icon, className }: StatBoxProps) {
  return (
    <div className={cn("stat-box", className)}>
      <div className="stat-box-label flex items-center gap-2 text-muted-foreground text-[0.85rem] font-semibold">
        {icon && <Icon name={icon} size={20} className="text-primary" />}
        <span>{label}</span>
      </div>
      <div className="stat-box-value text-[2.2rem] font-black text-foreground">
        {value}
      </div>
    </div>
  );
}
