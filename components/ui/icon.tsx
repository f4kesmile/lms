import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  filled?: boolean;
}

export function Icon({
  name,
  size = 24,
  filled = false,
  className,
  ...props
}: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined shrink-0",
        filled && "material-symbols-filled",
        className
      )}
      style={{
        fontSize: size,
        ...props.style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
