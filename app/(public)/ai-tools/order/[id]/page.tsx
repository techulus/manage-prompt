import { ContentDeleteWarningAlert } from "@/components/ai-tools/content-deletion-warning-alert";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/utils/db";
import { Aperture, CropIcon } from "lucide-react";
import Link from "next/link";
import sharp from "sharp";

export default async function AIToolsResult(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;

  const { id } = params;

  const order = await prisma.imageOrder.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!order || !order.outputUrl) {
    return <PageTitle title="Order not found" />;
  }

  const image = await fetch(order.outputUrl)
    .then((res) => res.arrayBuffer())
    .catch(() => null);

  if (!image) {
    return <PageTitle title="Order not found" />;
  }
  const metadata = await sharp(image).metadata();

  return (
    <>
      <PageTitle title="It's ready!" subTitle={order.type} />

      <PageSection topInset>
        <CardContent>
          <ContentDeleteWarningAlert />

          <div className="mt-6 lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-6">
            <div className="lg:col-span-4 lg:row-end-1">
              <div
                className={cn(
                  "aspect-h-3 aspect-w-4 overflow-hidden border bg-gray-100 dark:bg-card"
                )}
              >
                <img
                  src={String(order.outputUrl)}
                  alt="Result"
                  className="block object-cover object-center mx-auto"
                />
              </div>
              {/* transparent overlay */}
              <div className="absolute inset-0 pointer-events-none" />
            </div>

            <div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
              <div className="lg:col-start-3 lg:row-end-1">
                <h2 className="sr-only">Summary</h2>
                <div className="shadow-sm ring-1 ring-gray-200 dark:ring-slate-800">
                  <dl className="flex flex-wrap">
                    <div className="flex-auto pl-6 pt-6">
                      <dt className="text-sm font-semibold leading-6">
                        Prompt
                      </dt>
                      <dd className="mt-1 text-base font-semibold leading-6">
                        {order.inputPrompt ?? "-"}
                      </dd>
                    </div>
                    <div className="flex-none self-end px-6 pt-4">
                      <dt className="sr-only">Status</dt>
                      <Badge>{order.type}</Badge>
                    </div>
                    <div className="mt-6 flex w-full flex-none gap-x-4 border-t px-6 pt-6">
                      <dt className="flex-none">
                        <span className="sr-only">Format</span>
                        <Aperture
                          className="h-6 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd className="text-sm font-medium leading-6  uppercase">
                        {metadata.format}
                      </dd>
                    </div>
                    <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                      <dt className="flex-none">
                        <span className="sr-only">Size</span>
                        <CropIcon
                          className="h-6 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd className="text-sm leading-6">
                        {metadata.width} x {metadata.height} px
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-6 border-t px-6 py-6">
                    <Link
                      href={`/api/ai-tools/order/download?id=${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      className={buttonVariants({
                        variant: "default",
                        size: "lg",
                      })}
                    >
                      Download <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              <Link href={`/ai-tools/${order.type}`} prefetch={false}>
                <Button variant="link" className="mt-4">
                  Try again
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </PageSection>
    </>
  );
}
