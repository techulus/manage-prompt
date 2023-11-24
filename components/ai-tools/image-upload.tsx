"use client";

import { PhotoIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Spinner } from "../core/loaders";

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete: (url: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setLoading(true);

      const uploaders = acceptedFiles.map(async (file) => {
        try {
          return fetch(`/api/ai-tools/upload`, {
            method: "put",
            body: file,
          })
            .then((res) => res.json())
            .then((result) => {
              setProcessing(true);
              toast
                .promise(onUploadComplete(result.url), {
                  loading: "Processing...",
                  success: "Done!",
                  error: "Failed to process image!",
                })
                .finally(() => {
                  setProcessing(false);
                });
            });
        } catch (e) {
          setLoading(false);
          setProcessing(false);
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
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className="mt-2 flex justify-center rounded-lg border border-dashed border-blue-500 dark:border-blue-600 px-6 py-10"
    >
      {loading || processing ? (
        <Spinner
          className="ml-2"
          message={loading ? "Uploading Image" : "Running AI Model"}
        />
      ) : (
        <div className="text-center">
          <PhotoIcon
            className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-600"
            aria-hidden="true"
          />
          <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-semibold text-blue-500 dark:text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-700 hover:dark:text-blue-500"
            >
              <span>Upload an image</span>
              <input {...getInputProps()} disabled={loading} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
}
