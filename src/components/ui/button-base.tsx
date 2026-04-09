"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
  stateFocus,
  stateInvalid,
  triggerStateBordersFor,
  triggerStateRingsFor,
} from "@/components/typography/control-states";
import { fieldHeight } from "@/components/typography/field";
import { cn } from "@/lib/utils";

/**
 * Shared action-control primitive.
 *
 * Ownership model:
 * - This file owns button/link surfaces, icon spacing, and selected/expanded button behavior.
 * - It intentionally reuses `fieldHeight` so buttons and fields stay on one control-size scale.
 * - It intentionally reuses `stateFocus` / `stateInvalid` / `triggerStateBordersFor` /
 *   `triggerStateRingsFor` so control
 *   states stay aligned across the DS instead of drifting per component.
 */

/** Border + ring on trigger states (neutral). */
const buttonTriggerChrome = [
  ...triggerStateBordersFor("border-ring"),
  ...triggerStateRingsFor("ring-ring/50"),
];
/** Ring stack only — `reverse` / `reverse-outline` own border color when pressed/open. */
const buttonTriggerRings = triggerStateRingsFor("ring-ring/50");
const buttonTriggerRingsDestructive = [
  ...triggerStateBordersFor("border-destructive/40"),
  ...triggerStateRingsFor("ring-destructive/20"),
];

const buttonVariants = cva(
  [
    // layout
    "group/button inline-flex shrink-0 items-center justify-center justify-self-start",
    // shape
    "rounded-none border border-transparent bg-clip-padding",
    // typography
    "whitespace-nowrap font-medium text-button",
    // interaction
    "select-none outline-none active:translate-y-px",
    // focus
    ...stateFocus,
    // disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // validation (full treatment lives in `stateInvalid` from control-states)
    ...stateInvalid,
    // svg
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-']):not([data-slot=spinner])]:size-em",
    "[&_svg[data-slot=spinner]]:size-[0.8em]",
    // transitions
    "transition-all",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-background bg-background text-foreground",
          "hover:bg-background/80",
          "aria-expanded:bg-background aria-expanded:text-foreground",
          ...buttonTriggerChrome,
        ],
        reverse: [
          "border-foreground bg-foreground text-background",
          "hover:bg-foreground/80",
          // control states
          "aria-expanded:bg-foreground aria-expanded:text-background",
          "aria-pressed:border-background aria-pressed:bg-background aria-pressed:text-foreground",
          "aria-pressed:hover:bg-background/80",
          "data-[state=open]:border-background data-[state=open]:bg-background data-[state=open]:text-foreground",
          "data-[state=open]:hover:bg-background/80",
          ...buttonTriggerRings,
        ],
        "reverse-outline": [
          "border border-background/50 bg-transparent text-background",
          "hover:border-background/80 hover:bg-background/10",
          // control states
          "aria-expanded:border-background aria-expanded:bg-background/5",
          "aria-pressed:border-background aria-pressed:bg-background aria-pressed:text-foreground",
          "aria-pressed:hover:bg-background/80",
          "data-[state=open]:border-background data-[state=open]:bg-background data-[state=open]:text-foreground",
          "data-[state=open]:hover:bg-background/80",
          ...buttonTriggerRings,
        ],
        accent: [
          "border-accent bg-accent text-background",
          "hover:bg-accent/80",
          "aria-expanded:bg-accent aria-expanded:text-background",
          ...buttonTriggerChrome,
        ],
        highlight: [
          "border-highlight bg-highlight text-background",
          "hover:bg-highlight/80",
          "aria-expanded:bg-highlight aria-expanded:text-background",
          ...buttonTriggerChrome,
        ],
        outline: [
          "border-ring bg-background",
          "hover:bg-muted hover:text-foreground",
          ...buttonTriggerChrome,
          "aria-expanded:bg-muted aria-expanded:text-foreground",
        ],
        ghost: [
          "hover:bg-muted hover:text-foreground",
          ...buttonTriggerChrome,
          "aria-expanded:bg-muted aria-expanded:text-foreground",
        ],
        destructive: [
          "bg-destructive/10 text-destructive",
          "hover:bg-destructive/20",
          "focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
          ...buttonTriggerRingsDestructive,
          "aria-expanded:bg-destructive/20 aria-expanded:text-destructive",
        ],
        link: "text-primary underline-offset-4 hover:underline",
        "case-study-link": [
          "pl-0! font-semibold text-(--highlight-color) text-xlarge",
          "underline decoration-transparent underline-offset-4",
          "transition-[text-decoration-color] duration-200 ease-[var(--ease-standard)]",
          "hover:decoration-current",
          "group-hover:decoration-current",
          "[&_svg]:transition-transform [&_svg]:duration-300",
          "hover:[&_svg]:translate-x-1",
          "group-hover:[&_svg]:translate-x-1",
          "[&_svg]:[--lucide-stroke-width:2]",
        ],
      },
      size: {
        default: [
          fieldHeight.default,
          "gap-1.5",
          "px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
          "in-data-[slot=button-group]:rounded-button",
        ],
        xs: [
          fieldHeight.xs,
          "gap-1",
          "rounded-[min(var(--radius-button),8px)]",
          "px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
          "text-xs",
          "in-data-[slot=button-group]:rounded-button",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
        sm: [
          fieldHeight.sm,
          "gap-1.5",
          "rounded-[min(var(--radius-button),10px)]",
          "px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
          "in-data-[slot=button-group]:rounded-button",
        ],
        lg: [
          fieldHeight.lg,
          "text-large",
          "gap-2",
          "px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
          "in-data-[slot=button-group]:rounded-card",
        ],
        icon: "size-button",
        "icon-xs": [
          "size-button-xs",
          "rounded-[min(var(--radius-button),8px)]",
          "in-data-[slot=button-group]:rounded-button",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
        "icon-sm": [
          "size-8",
          "rounded-[min(var(--radius-button),10px)]",
          "in-data-[slot=button-group]:rounded-button",
        ],
        "icon-lg": "size-tab",
      },
      fullWidth: {
        true: "w-full justify-self-stretch",
      },
      mono: {
        true: "font-mono uppercase tracking-[0.05em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  fullWidth,
  mono,
  selected,
  type,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    fullWidth?: boolean;
    mono?: boolean;
    selected?: boolean;
  }) {
  return (
    <ButtonPrimitive
      className={cn(
        buttonVariants({ variant, size, fullWidth, mono, className })
      )}
      data-slot="button"
      type={
        type ??
        ("button" satisfies React.ButtonHTMLAttributes<HTMLButtonElement>["type"])
      }
      {...(selected && {
        "data-state": "open",
        "aria-pressed": true,
        "aria-selected": true,
      })}
      {...props}
    />
  );
}

function ButtonLink({
  className,
  variant = "default",
  size = "default",
  fullWidth,
  mono,
  selected,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    fullWidth?: boolean;
    mono?: boolean;
    selected?: boolean;
  }) {
  return (
    <ButtonPrimitive
      className={cn(
        buttonVariants({ variant, size, fullWidth, mono, className })
      )}
      data-slot="button"
      nativeButton={false}
      render={<a {...props}>{children}</a>}
      {...(selected && {
        "data-state": "open",
        "aria-pressed": true,
        "aria-selected": true,
      })}
    />
  );
}

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export { Button, ButtonLink, buttonVariants };
