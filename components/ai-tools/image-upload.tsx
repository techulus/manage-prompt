"use client";

import { PhotoIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Spinner } from "../core/loaders";

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
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
              onUploadComplete(result.url);
            });
        } catch (e) {
          console.error(e);
          return null;
        }
      });

      toast
        .promise(Promise.all(uploaders), {
          loading: "Processing...",
          success: "Done!",
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
  });

  return (
    <div
      {...getRootProps()}
      className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
    >
      {loading ? (
        <Spinner className="ml-2" />
      ) : (
        <div className="text-center">
          <PhotoIcon
            className="mx-auto h-12 w-12 text-gray-300"
            aria-hidden="true"
          />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input {...getInputProps()} disabled={loading} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
