import PageTitle from "@/components/layout/page-title";
import { prisma } from "@/lib/utils/db";

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

  const workflow = await prisma.workflow.findUnique({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: +params.workflowId,
    },
  });

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
      />
      {props.children}
    </div>
  );
}
