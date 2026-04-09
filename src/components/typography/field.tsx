import { cva } from "class-variance-authority";
import { stateFocus, stateInvalid } from "./control-states";

/**
 * Shared field/control geometry.
 *
 * Ownership model:
 * - `fieldVariants` owns the default text-entry shell for inputs/select-like controls.
 * - `fieldHeight` is the shared control-size scale for both fields and buttons so the
 *   system keeps one height contract across interactive primitives.
 * - Shared focus/invalid state visuals live in `control-states.ts`; this file composes
 *   and re-exports them for field-oriented call sites.
 */

export {
  stateFocus,
  stateInvalid,
  TRIGGER_RING_STATE_PREFIXES,
  triggerStateBordersFor,
  triggerStateRingsFor,
} from "./control-states";

export const fieldHeight = {
  xs: "h-button-xs", // 25px
  sm: "h-8", // 32px
  base: "h-9", // 36px
  default: "h-button", // 44px
  lg: "h-tab", // 54px
  xl: "h-16", // 64px
};

export const fieldVariants = cva(
  [
    // layout
    "flex w-full",
    "border border-transparent",
    "rounded-button px-3 py-1",
    // typography
    "text-body placeholder:text-foreground-dim",
    // transitions
    "transition-[color,box-shadow]",
    // focus & validation states
    ...stateFocus,
    ...stateInvalid,
    "outline-none",
    // disabled state
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "bg-muted",
        outline: "border-input",
      },
      size: {
        sm: fieldHeight.sm,
        default: fieldHeight.default,
        lg: fieldHeight.lg,
        xl: fieldHeight.xl,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
