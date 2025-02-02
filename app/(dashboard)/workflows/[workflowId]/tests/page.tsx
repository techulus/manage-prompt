import EmptyState from "@/components/core/empty-state";
import PageSection from "@/components/core/page-section";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowTests(props: Props) {
  const params = await props.params;

  return (
    <PageSection topInset>
      <EmptyState
        show
        label="test"
        createLink={`workflows/${params.workflowId}/tests/new`}
      />
    </PageSection>
  );
}
