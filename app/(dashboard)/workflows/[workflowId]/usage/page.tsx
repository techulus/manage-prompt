import { WorkflowUsageCharts } from "@/components/console/workflow/workflow-usage-charts";
import PageSection from "@/components/core/page-section";
import { CardContent, CardHeader } from "@/components/ui/card";
import { getWorkflowRunStats } from "@/lib/utils/analytics";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowUsage(props: Props) {
  const params = await props.params;

  const usageData = await getWorkflowRunStats(+params.workflowId);
  const totalTokensConsumed = usageData.reduce(
    (acc, run) => acc + run.tokens,
    0,
  );

  return (
    <PageSection topInset>
      <CardHeader>
        <h3 className="text-lg font-semibold">Usage (Last 30 days)</h3>
      </CardHeader>
      <CardContent>
        <div className="flex-row items-center space-x-2">
          <WorkflowUsageCharts usageData={usageData} />

          <div className="flex flex-col md:flex-row justify-between space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total Tokens</span>
              <span className="text-2xl font-semibold">
                {totalTokensConsumed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </PageSection>
  );
}
