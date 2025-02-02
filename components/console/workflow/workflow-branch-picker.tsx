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
import { useSearchParams } from "next/navigation";

export function WorkflowBranchPicker({
  workflow,
  branches,
}: {
  workflow: { id: number };
  branches: { shortId: string }[];
}) {
  const query = useSearchParams();
  const branch = query.get("branch") ?? "main";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono">
          <GitBranchIcon className="w-4 h-4 inline mr-2" />
          {branch.substring(0, 7)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <Link href={`/workflows/${workflow.id}`} className="font-mono">
            <GitBranchIcon className="w-4 h-4 inline mr-2" />
            main
          </Link>
        </DropdownMenuItem>
        {branches?.map((branch) => (
          <DropdownMenuItem key={branch.shortId}>
            <Link
              href={`/workflows/${workflow.id}?branch=${branch.shortId}`}
              className="font-mono"
            >
              <GitBranchIcon className="w-4 h-4 inline mr-2" />
              {branch.shortId.substring(0, 7)}
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
