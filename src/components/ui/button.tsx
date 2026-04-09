import { Slot as SlotPrimitive } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, type LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/classes";
import { fieldHeight, stateFocus, stateInvalid } from "../typography/field";

const buttonVariants = cva(
  [
    // layout
    "inline-flex shrink-0 items-center justify-center",
    "rounded-button",
    // interactions
    "group cursor-pointer select-none",
    // typography
    "font-medium",
    "whitespace-nowrap",
    // disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // aria & focus states
    stateInvalid,
    stateFocus,
    // svg
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-']):not([data-slot=spinner])]:size-em",
    "[&_svg[data-slot=spinner]]:size-[0.8em]",
    // "[&_svg:not([data-slot=spinner])]:translate-y-[-0.025em]",
    // transitions
    "transition-all",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90",
        accent:
          "bg-accent text-background hover:bg-accent-foreground data-[state=open]:bg-accent-surface",
        dc: [
          "bg-dc text-background hover:bg-dc-foreground data-[state=open]:bg-accent-surface",
        ],
        default: "bg-foreground text-background hover:bg-foreground",
        iris: "bg-irisLight text-background hover:bg-irisLight/90 data-[state=open]:bg-irisLight/90",
        outline: [
          // shadow-xs
          "border border-ring/20 bg-background",
          // "hover:bg-muted "
          "hover:border-ring active:border-ring",
          "active:ring-[3px] active:ring-ring/50 data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50",
          // ARIA-driven persistent selection
          "aria-pressed:border-ring aria-pressed:ring-[3px] aria-pressed:ring-ring/50",
          "aria-selected:border-ring aria-selected:ring-[3px] aria-selected:ring-ring/50",
        ],
        ghost: "hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive-foreground text-destructive-reversed hover:bg-destructive-foreground/90 focus-visible:ring-destructive/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        pill: [fieldHeight.xs, "gap-1 rounded-full px-1.5 py-0.5", "text-fine"],
        xs: [
          fieldHeight.xs,
          "gap-[5px] rounded-button px-2 has-[>svg]:px-2",
          "[&_svg:not([class*='size-'])]:size-[0.9em]!",
          "text-fine",
        ],
        sm: [
          fieldHeight.sm,
          "gap-1.5 rounded-button px-2.5 has-[>svg]:px-2.5",
          "font-semibold text-small",
        ],
        icon: [
          // same height as fieldHeight.default,
          "size-button shrink-0 [&_svg:not([class*=size-])]:size-5.5",
        ],
        default: [
          fieldHeight.default,
          "gap-1.5 rounded-button px-4 has-[>svg]:px-3",
          "text-button",
        ],
        lg: [
          fieldHeight.lg,
          "gap-1.5 rounded-button px-6 has-[>svg]:px-4",
          "text-button",
        ],
        xl: [
          fieldHeight.xl,
          "gap-1.75 rounded-card px-6 has-[>svg]:px-4",
          "[&_svg:not([class*='size-'])]:size-[0.9lh]", // test lh :)
          // "[&_svg:not([class*='size-'])]:size-[1.25em]",
          "text-button",
        ],
      },
      fullWidth: {
        true: "w-full",
      },
    },
    compoundVariants: [
      {
        size: ["pill", "xs", "sm"],
        // className: "[&_svg:not([data-slot=spinner])]:translate-y-[-0.05em]",
      },
      {
        variant: "iris",
        size: "sm",
        className: "px-w6",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      // mode: "default",
      // shape: "default",
      // appearance: "default",
    },
  }
);

/**
 * States (short + explicit):
 * - active (:active): pointer is down. Transient press feedback only.
 * - pressed (aria-pressed): toggle control is ON. Persistent. Use for toggles.
 * - selected (aria-selected): this item is chosen in a group/list. Persistent.
 * - legacy selected: `selected` prop sets data-state="open" (kept for compat).
 * - focus-visible: ring via stateFocus.
 *
 * Use:
 * <Button variant="outline" aria-pressed>…</Button>
 * <Button variant="outline" aria-selected>…</Button>
 */
function Button({
  className,
  selected,
  variant,
  size,
  fullWidth,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    selected?: boolean;
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive : "button";
  const resolvedType = asChild ? undefined : (type ?? "button");
  return (
    <Comp
      className={cn(
        buttonVariants({
          variant,
          size,
          fullWidth,
          className,
        }),
        // When `asChild` wraps non-button elements (e.g. links), native `disabled:*`
        // styles do not apply, so we still block interaction explicitly.
        asChild && props.disabled && "pointer-events-none"
      )}
      data-slot="button"
      type={resolvedType}
      {...(selected && {
        "data-state": "open",
        "aria-pressed": true,
        "aria-selected": true,
      })}
      {...props}
    />
  );
}

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon;
}

/**
 * Styled icon for button suffixes (dropdowns, menus, etc.).
 * Uses `ms-auto` to push to the right edge.
 *
 * @example
 * <Button>Label<ButtonArrow /></Button>
 * <Button>Label<ButtonArrow icon={ArrowRight} /></Button>
 */
function ButtonArrow({
  icon: Icon = ChevronDown,
  className,
  ...props
}: ButtonArrowProps) {
  return (
    <Icon
      className={cn("ms-auto -me-1", className)}
      data-slot="button-arrow"
      {...props}
    />
  );
}

export { Button, ButtonArrow, buttonVariants };
