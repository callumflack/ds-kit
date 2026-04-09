"use client";

import { ArrowUpRightIcon, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Text } from "@/components/typography/text";
import { cn } from "@/lib/classes";

type ExternalLinkProps = Omit<ComponentPropsWithoutRef<"a">, "children"> & {
  children: ReactNode;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon | null;
  leadingIconClassName?: string;
  trailingIconClassName?: string;
  textClassName?: string;
};

export function ExternalLink({
  children,
  className,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon = ArrowUpRightIcon,
  leadingIconClassName,
  trailingIconClassName,
  target = "_blank",
  rel = "noopener noreferrer",
  textClassName,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground text-small transition-colors hover:text-foreground",
        className
      )}
      rel={rel}
      target={target}
      {...props}
    >
      {LeadingIcon ? (
        <LeadingIcon
          aria-hidden
          className={cn("size-em", leadingIconClassName)}
        />
      ) : null}
      {typeof children === "string" ? (
        <Text
          as="span"
          className={textClassName}
          color="inherit"
          intent="small"
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {TrailingIcon ? (
        <TrailingIcon
          aria-hidden
          className={cn("-ml-px size-[0.9em]", trailingIconClassName)}
        />
      ) : null}
    </a>
  );
}
