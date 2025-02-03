"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";
import { Button } from "../ui/button";

export const DeleteButton = ({
  label = "Delete",
  size = "default",
  compact = false,
}: {
  label?: string;
  size?: "default" | "sm";
  compact?: boolean;
}) => {
  const { pending } = useFormStatus();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (showConfirmDelete) {
    return (
      <>
        <Button type="submit" variant="destructive" size={size}>
          {pending ? (
            <Spinner message="Processing..." />
          ) : compact ? (
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              Confirm {label}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size={size}
          onClick={() => setShowConfirmDelete(false)}
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </>
    );
  }

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setShowConfirmDelete(true);
      }}
      variant="ghost"
      size={size}
    >
      <TrashIcon
        className={cn("h-4 w-4", compact ? "" : "mr-2")}
        aria-hidden="true"
      />
      {compact ? "" : label}
    </Button>
  );
};

export const SaveButton = ({
  icon = null,
  label = "Save",
  loadingLabel = "Saving",
  disabled = false,
}: {
  icon?: React.ReactElement | null;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <Spinner message={loadingLabel} />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};

export const ActionButton = ({
  variant = "ghost",
  icon = null,
  label = "Save",
  loadingLabel = "Saving",
  disabled = false,
  size = "default",
  className,
}: {
  variant?: "default" | "ghost" | "link" | "destructive";
  size?: "default" | "sm";
  className?: string;
  icon?: React.ReactElement | null;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending || disabled}
      className={className}
      size={size}
    >
      {pending ? (
        <Spinner message={loadingLabel} />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};

export const UpdateProfileButton = () => (
  <Button
    type="button"
    variant="link"
    onClick={() => {
      // @ts-ignore
      window?.Clerk?.openUserProfile();
    }}
  >
    Update
  </Button>
);
