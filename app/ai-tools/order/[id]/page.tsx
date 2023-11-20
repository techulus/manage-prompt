/* eslint-disable @next/next/no-img-element */
import { ContentBlock } from "@/components/core/content-block";
import { ActionButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/utils/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createPaymentLink } from "../../actions";

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

  async function handlePayment(formData: FormData) {
    "use server";
    if (!order) return;

    const email = formData.get("email") as string;

    const paymentLink =
      order?.stripePaymentLink ??
      (await createPaymentLink(order.id, order?.email ?? email));

    redirect(paymentLink.url + "?prefilled_email=" + encodeURIComponent(email));
  }

  return (
    <>
      <PageTitle title="It's ready!" subTitle={order.type} />

      <ContentBlock>
        <CardContent>
          <div className="mt-6 lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 xl:gap-x-16">
            <div className="lg:col-span-4 lg:row-end-1">
              <div
                className={cn(
                  "output-image",
                  "aspect-h-3 aspect-w-4 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-900",
                  order.paymentStatus === "paid" ? "" : "watermarked"
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

            <form
              action={handlePayment}
              className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none"
            >
              <div className="flex flex-col-reverse">
                <div className="mt-4">
                  <h1 className="text-2xl font-bold tracking-tightsm:text-3xl">
                    Order #{order.id}
                  </h1>
                </div>
              </div>

              {order.paymentStatus == "paid" ? (
                <p className="my-6">
                  You have already paid for this order. You can download it now.
                </p>
              ) : (
                <p className="my-6">
                  You can download it after making the payment. Please provide
                  your email address so that you can retrieve your order later.
                </p>
              )}

              <div className="grid w-full items-center gap-1.5">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={order?.email ?? ""}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4">
                {order.paymentStatus === "paid" ? (
                  <Button className="w-full" type="button">
                    Download
                  </Button>
                ) : (
                  <ActionButton
                    className="w-full"
                    label="Pay $1"
                    variant="default"
                    loadingLabel="Redirecting to payment..."
                  />
                )}
                <Link href={`/ai-tools/${order.type}`}>
                  <Button variant="link" className="w-full">
                    Try again
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}
