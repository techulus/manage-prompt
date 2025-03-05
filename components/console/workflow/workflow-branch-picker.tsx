"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitBranchIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function WorkflowBranchPicker({
  workflow,
  branches,
}: {
  workflow: { id: number };
  branches: { shortId: string }[];
}) {
  const query = useSearchParams();
  const path = usePathname();
  const branch = query.get("branch") ?? "main";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-mono">
          <GitBranchIcon className="w-4 h-4 inline mr-1" />
          {branch}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <Link href={path} className="font-mono">
            <GitBranchIcon className="w-4 h-4 inline mr-1" />
            main
          </Link>
        </DropdownMenuItem>
        {branches?.map((branch) => (
          <DropdownMenuItem key={branch.shortId}>
            <Link
              href={`${path}?branch=${branch.shortId}`}
              className="font-mono"
            >
              <GitBranchIcon className="w-4 h-4 inline mr-1" />
              {branch.shortId}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem>
          <Link href={`/workflows/${workflow.id}/branches/new`}>
            <PlusIcon className="w-4 h-4 inline mr-1" /> Branch
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
