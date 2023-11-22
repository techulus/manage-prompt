import { ContentBlock } from "@/components/core/content-block";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
  return (
    <>
      <div className="flex justify-center border-b border-gray-200 dark:border-gray-800 pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:px-8 xl:py-10 dark:text-white bg-gray-50 dark:bg-gray-900">
        <div className="flex w-full justify-between max-w-7xl">
          <Skeleton className="w-[300px] h-[55px] rounded-md" />
        </div>
      </div>

      <div className="h-8"></div>

      <ContentBlock>
        <CardContent>
          <div className="flex flex-col pt-6 space-y-2">
            <Skeleton className="w-full h-[28px] rounded-md" />
            <Skeleton className="w-full h-[28px] rounded-md" />
            <Skeleton className="w-[124px] h-[28px] rounded-md" />
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}
