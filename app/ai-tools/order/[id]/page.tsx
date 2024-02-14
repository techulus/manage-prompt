/* eslint-disable @next/next/no-img-element */
import { ContentDeleteWarningAlert } from "@/components/ai-tools/content-deletion-warning-alert";
import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/utils/db";
import Link from "next/link";

export default async function AIToolsResult({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const order = await prisma.imageOrder.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!order) {
    return <PageTitle title="Order not found" />;
  }

  return (
    <>
      <PageTitle title="It's ready!" subTitle={order.type} />

      <ContentBlock>
        <CardContent>
          <ContentDeleteWarningAlert />

          <div className="mt-6 lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 xl:gap-x-16">
            <div className="lg:col-span-4 lg:row-end-1">
              <div
                className={cn(
                  "aspect-h-3 aspect-w-4 overflow-hidden rounded-lg border bg-gray-100 dark:bg-card"
                )}
              >
                <img
                  src={String(order.outputUrl)}
                  alt="Result"
                  className="block object-cover object-center mx-auto"
                />
              </div>
              {/* transparent overlay */}
              <div className="absolute inset-0 pointer-events-none"></div>
            </div>

            <div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
              <div className="flex flex-col-reverse">
                <div className="mt-4">
                  <h1 className="text-2xl font-bold tracking-tightsm:text-3xl">
                    Order #{order.id}
                  </h1>
                </div>
              </div>

              <p className="my-6">
                You can download the image without watermark after payment.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4">
                <Link
                  href={`/api/ai-tools/order/download?id=${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full"
                  )}
                >
                  Download
                </Link>

                <Link href={`/ai-tools/${order.type}`}>
                  <Button variant="link" className="w-full">
                    Try again
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}
