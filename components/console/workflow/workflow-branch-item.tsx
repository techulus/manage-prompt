"use client";

import { DateTime } from "@/lib/utils/datetime";
import type { WorkflowBranch } from "@prisma/client";
import { GitBranchIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../../ui/drawer";

interface Props {
  branch: WorkflowBranch;
}

export function WorkflowBranchItem({ branch }: Props) {
  const { shortId, model, template, createdAt } = branch;

  return (
    <li
      key={shortId}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              <GitBranchIcon className="w-4 h-4 mr-1 inline" />{" "}
              {shortId.substring(0, 7)}
            </span>

            <span aria-hidden="true">&middot;</span>
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              {model}
            </span>
          </p>
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {DateTime.fromJSDate(createdAt).toNiceFormat()}
        </time>
      </div>

      <div className="flex space-x-3 mt-3">
        <Button size="sm">Merge</Button>

        <Link
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
          href={`/workflows/${branch.workflowId}/branches/${shortId}/edit`}
        >
          Edit
        </Link>

        <Drawer>
          <DrawerTrigger
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            View Template
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader />

            <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px]">
              {template}
            </pre>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="mb-6">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </li>
  );
}
