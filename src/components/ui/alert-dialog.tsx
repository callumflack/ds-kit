"use client";

import {
  Action as AlertDialogActionPrimitive,
  Cancel as AlertDialogCancelPrimitive,
  Content as AlertDialogContentPrimitive,
  Description as AlertDialogDescriptionPrimitive,
  Overlay as AlertDialogOverlayPrimitive,
  Portal as AlertDialogPortal,
  Root as AlertDialogRoot,
  Title as AlertDialogTitlePrimitive,
  Trigger as AlertDialogTriggerPrimitive,
} from "@radix-ui/react-alert-dialog";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contentSizeClasses = {
  default: "max-w-lg",
  sm: "max-w-[380px]",
  lg: "max-w-2xl",
} as const;

type AlertDialogContentProps = ComponentPropsWithoutRef<
  typeof AlertDialogContentPrimitive
> & {
  size?: keyof typeof contentSizeClasses;
};

type AlertDialogButtonProps = ComponentPropsWithoutRef<typeof Button>;

const AlertDialog = AlertDialogRoot;
const AlertDialogTrigger = AlertDialogTriggerPrimitive;

function AlertDialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogOverlayPrimitive>) {
  return (
    <AlertDialogOverlayPrimitive
      className={cn(
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 border border-ring/15 bg-background p-6 shadow-xl",
          contentSizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogContentPrimitive>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("grid gap-3", className)} {...props} />;
}

function AlertDialogFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogTitlePrimitive>) {
  return (
    <AlertDialogTitlePrimitive
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogDescriptionPrimitive>) {
  return (
    <AlertDialogDescriptionPrimitive
      className={cn("text-foreground-muted", className)}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  children?: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-card", className)} {...props}>
      {children}
    </div>
  );
}

function AlertDialogAction({
  variant = "destructive",
  ...props
}: AlertDialogButtonProps) {
  return (
    <AlertDialogActionPrimitive asChild>
      <Button variant={variant} {...props} />
    </AlertDialogActionPrimitive>
  );
}

function AlertDialogCancel({
  variant = "outline",
  ...props
}: AlertDialogButtonProps) {
  return (
    <AlertDialogCancelPrimitive asChild>
      <Button variant={variant} {...props} />
    </AlertDialogCancelPrimitive>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
};
