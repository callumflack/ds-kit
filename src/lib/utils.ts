import type { ClassValue } from "clsx";
import { cn as classNames } from "./classes";

// Backwards compatibility shim for older imports.
export function cn(...inputs: ClassValue[]) {
  return classNames(...inputs);
}
