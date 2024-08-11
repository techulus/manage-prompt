"use client";

import { FileIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Spinner } from "../../core/loaders";
import { notifyError } from "../../core/toast";
import { buttonVariants } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

export const ImportWorkflowDialog = () => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLoading(true);

    const uploaders = acceptedFiles.map(async (file) => {
      try {
        return fetch(`/api/workflows/import`, {
          method: "put",
          body: file,
        })
          .then((res) => res.json())
          .then((res) => {
            if (res?.success) {
              window.location.reload();
            } else {
              notifyError(
                res?.message ||
                  "Failed to upload file, please try again or contact support.",
              );
            }
          });
      } catch (e) {
        setLoading(false);
        console.error(e);
        return null;
      }
    });

    toast
      .promise(Promise.all(uploaders), {
        loading: "Uploading...",
        success: "Upload completed!",
        error: "Failed to upload file(s)",
      })
      .finally(() => setLoading(false));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/json": [".json"],
    },
    maxSize: 1 * 1024 * 1024,
  });

  return (
    <Dialog>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
          className: "hidden lg:block",
        })}
      >
        Import
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Workflow from JSON</DialogTitle>
          <DialogDescription>
            Please provide the JSON file to import the workflow.
            <div
              {...getRootProps()}
              className="mt-8 flex justify-center rounded-lg border border-dashed border-primary px-6 py-10"
            >
              {loading ? (
                <Spinner className="ml-2" message="Importing..." />
              ) : (
                <div className="text-center">
                  <FileIcon
                    className="mx-auto h-12 w-12 text-primary"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
                    >
                      <span>Select JSON file</span>
                      <input {...getInputProps()} disabled={loading} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
