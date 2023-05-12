"use client";

import { CheckIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export const DeleteButton = () => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (showConfirmDelete) {
    return (
      <button
        type="submit"
        className="relative -ml-px hidden items-center gap-x-1.5 rounded-full bg-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:z-10 hover:bg-red-100 hover:text-red-600 focus:z-10 sm:inline-flex"
      >
        <CheckIcon
          className="-ml-0.5 h-5 w-5 text-red-700"
          aria-hidden="true"
        />
        Confirm Delete
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
