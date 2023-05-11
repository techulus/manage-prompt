import PageTitle from "@/components/layout/page-title";
import prisma from "@/utils/db";
import { Workflow } from "@prisma/client";

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function Workflows({ params }: Props) {
  const workflow: Workflow | null = await prisma.workflow.findUnique({
    where: {
      id: Number(params.id),
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <>
      <PageTitle title={workflow.name} backUrl="/console/workflows" />
    </>
  );
}
