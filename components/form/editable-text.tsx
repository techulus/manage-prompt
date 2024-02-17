"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ActionButton } from "./button";

export function EditableValue({
  id,
  name,
  value,
}: {
  id: string | number;
  name: string;
  value: string | number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const { pending } = useFormStatus();

  useEffect(() => {
    if (!pending) {
      setIsEditing(false);
    }
  }, [pending]);

  return (
    <div>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={name} />
      {isEditing ? (
        <div className="flex">
          <Input
            name={name}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="h-5 w-[60px]"
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
    </div>
  );
}
