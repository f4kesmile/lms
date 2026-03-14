import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./string";
export * from "./date";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
