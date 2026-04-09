import type { ReactNode } from "react";
import {
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SettingsConfirmActionProps {
  actionLabel: string;
  description: ReactNode;
  media?: ReactNode;
  onAction: () => void;
  title: ReactNode;
  trigger?: ReactNode;
  triggerLabel?: string;
}

export function SettingsConfirmAction({
  title,
  description,
  actionLabel,
  onAction,
  trigger,
  triggerLabel,
  media,
}: SettingsConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button" variant="ghost">
            {triggerLabel ?? actionLabel}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[380px]! rounded-card" size="sm">
        <AlertDialogHeader>
          {media ? (
            <AlertDialogMedia className="bg-transparent">
              {media}
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle className="w-fulltext-left text-large">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-foreground-dim text-small">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-gap">
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction} size="sm" variant="destructive">
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
