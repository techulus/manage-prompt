import { WorkflowRun } from "@prisma/client";

interface Props {
  workflowRun: WorkflowRun;
}

export async function WorkflowRunItem({ workflowRun }: Props) {
  const { result, createdBy, createdAt } = workflowRun;

  return (
    <li
      key={workflowRun.id}
      className="relative bg-white px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {createdBy}
          </p>
        </div>
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {new Date(createdAt).toLocaleTimeString()}
        </time>
      </div>
      <div className="mt-1">
        <p className="text-sm text-gray-600 whitespace-pre-line">{result}</p>
      </div>
    </li>
  );
}
