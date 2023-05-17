"use client";

import { CheckIcon, TrashIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useState } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";

export const DeleteButton = () => {
  const { pending } = useFormStatus();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (showConfirmDelete) {
    return (
      <button
        type="submit"
        className="relative -ml-px hidden items-center gap-x-1.5 rounded-full bg-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:z-10 hover:bg-red-100 hover:text-red-600 focus:z-10 sm:inline-flex"
      >
        {pending ? (
          <Spinner message="Deleting..." />
        ) : (
          <>
            <CheckIcon
              className="-ml-0.5 h-5 w-5 text-red-700"
              aria-hidden="true"
            />
            Confirm Delete
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setShowConfirmDelete(true);
      }}
      className="relative -ml-px hidden items-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:z-10 hover:bg-red-100 hover:text-red-600 focus:z-10 sm:inline-flex"
    >
      <TrashIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
      Delete
    </button>
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
    <button
      type="submit"
      className={classNames(
        "inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        "disabled:bg-gray-400 disabled:cursor-not-allowed"
      )}
      disabled={pending || disabled}
    >
      {pending ? (
        <Spinner message={loadingLabel} />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
};

export const ActionButton = ({
  className = "",
  icon = null,
  label = "Save",
  loadingLabel = "Saving",
  disabled = false,
}: {
  className?: string;
  icon?: React.ReactElement | null;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={classNames(
        "relative inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:z-10 focus:z-10",
        "disabled:cursor-not-allowed",
        className
      )}
      disabled={pending || disabled}
    >
      {pending ? (
        <Spinner message={loadingLabel} />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
};
