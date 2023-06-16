import React from "react";
import { Card } from "../ui/card";

export const ContentBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    className="rounded-none xl:rounded-md xl:mt-4 xl:mx-auto max-w-7xl"
    ref={ref}
    {...props}
  />
));

ContentBlock.displayName = "ContentBlock";
