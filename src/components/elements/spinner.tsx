/* Taken from the Rainbow Wallet repo a long time ago… */

import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";
import { cn } from "@/lib/classes";

type SpinnerProps = Omit<ComponentPropsWithoutRef<"svg">, "children"> & {
  clipPathId?: string;
};

export function Spinner({
  clipPathId,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SpinnerProps) {
  const generatedId = useId().replace(/:/g, "");
  const resolvedClipPathId = clipPathId ?? `spinner-${generatedId}`;
  const titleId = `${resolvedClipPathId}-title`;
  const isDecorative = ariaLabel == null && ariaLabelledBy == null;
  const resolvedAriaLabelledBy = isDecorative
    ? undefined
    : (ariaLabelledBy ?? titleId);

  return (
    <svg
      aria-hidden={isDecorative ? true : undefined}
      aria-label={ariaLabel}
      aria-labelledby={resolvedAriaLabelledBy}
      className={cn(
        "size-em animate-spin motion-reduce:animate-none",
        className
      )}
      data-slot="spinner"
      fill="none"
      focusable="false"
      role={isDecorative ? "presentation" : "img"}
      viewBox="0 0 21 21"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {!isDecorative && ariaLabel != null ? (
        <title id={titleId}>{ariaLabel}</title>
      ) : null}
      <clipPath id={resolvedClipPathId}>
        <path d="M10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C11.3284 18 12 18.6716 12 19.5C12 20.3284 11.3284 21 10.5 21C4.70101 21 0 16.299 0 10.5C0 4.70101 4.70101 0 10.5 0C16.299 0 21 4.70101 21 10.5C21 11.3284 20.3284 12 19.5 12C18.6716 12 18 11.3284 18 10.5C18 6.35786 14.6421 3 10.5 3Z" />
      </clipPath>
      <foreignObject
        clipPath={`url(#${resolvedClipPathId})`}
        height="21"
        width="21"
        x="0"
        y="0"
      >
        <div style={iconPath} />
      </foreignObject>
    </svg>
  );
}

const iconPath = {
  background:
    "conic-gradient(from 180deg at 50% 50%, rgba(72, 146, 254, 0) 0deg, currentColor 282.04deg, rgba(72, 146, 254, 0) 319.86deg, rgba(72, 146, 254, 0) 360deg)",
  height: 21,
  width: 21,
};
