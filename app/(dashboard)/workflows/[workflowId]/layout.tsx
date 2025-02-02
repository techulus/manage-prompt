import { WorkflowBranchPicker } from "@/components/console/workflow/workflow-branch-picker";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/utils/db";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{
    workflowId: string;
  }>;

  children: React.ReactNode;
}

export default async function WorkflowLayout(props: Props) {
  const params = await props.params;

  const [workflow, branches] = await Promise.all([
    prisma.workflow.findUnique({
      select: {
        id: true,
        name: true,
      },
      where: {
        id: +params.workflowId,
      },
    }),
    prisma.workflowBranch.findMany({
      select: {
        shortId: true,
      },
      where: {
        workflowId: +params.workflowId,
      },
    }),
  ]);

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <div className="relative">
      <PageTitle
        title={workflow.name}
        backUrl="/workflows"
        actionLabel="Edit"
        actionLink={`/workflows/${workflow.id}/edit`}
      >
        <WorkflowBranchPicker branches={branches} workflow={workflow} />
        <Link
          href={`/workflows/${workflow.id}/tests/new`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          Test
        </Link>
      </PageTitle>
      {props.children}
    </div>
  );
}
