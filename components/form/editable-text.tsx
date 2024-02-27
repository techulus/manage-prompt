"use client";

import { useState } from "react";
import { notifyError, notifySuccess } from "../core/toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ActionButton } from "./button";

export function EditableValue({
  id,
  name,
  value,
  action,
  type,
}: {
  id: string | number;
  name: string;
  value: string | number;
  type: "text" | "number";
  action: (data: FormData) => Promise<any>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  return (
    <form
      action={async (formData: FormData) => {
        try {
          const result = await action(formData);
          if (result?.error) {
            notifyError(result.error);
          } else {
            notifySuccess("Updated successfully");
          }
        } finally {
          setIsEditing(false);
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={name} />
      {isEditing ? (
        <div className="flex">
          <Input
            name={name}
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="h-6 w-auto max-w-[160px]"
          />
          <ActionButton label="Save" className="h-5" />
        </div>
      ) : (
        <div className="flex">
          <p>{value}</p>
          <Button
            className="h-5"
            type="button"
            variant="link"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
      )}
    </form>
  );
}
