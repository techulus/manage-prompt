"use server";

import { prisma } from "@/lib/utils/db";
import { getAppBaseUrl } from "@/lib/utils/url";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createPaymentLink(orderId: number, email: string) {
  if (!orderId) throw new Error("No order ID provided");
  if (!email) throw new Error("No email provided");

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: process.env.STRIPE_IMAGE_ORDER_PRICE_ID,
        quantity: 1,
      },
    ],
    after_completion: {
      type: "redirect",
      redirect: {
        url: getAppBaseUrl() + "/ai-tools/result/" + orderId,
      },
    },
    metadata: {
      order_id: orderId,
    },
  });

  await prisma.imageOrder.update({
    where: {
      id: orderId,
    },
    data: {
      stripePaymentLink: paymentLink,
      email,
    },
  });

  return paymentLink;
}
