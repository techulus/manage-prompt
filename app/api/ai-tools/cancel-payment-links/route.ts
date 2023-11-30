import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function GET(_: Request) {
  const orders = await prisma.imageOrder.findMany({
    where: {
      paymentStatus: "pending",
      createdAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  console.log(`Found ${orders.length} orders to cancel`);

  for (const order of orders) {
    if (!order.stripePaymentLink) {
      console.log(`Order ${order.id} has no payment link`);
      await prisma.imageOrder.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "cancelled",
        },
      });
      continue;
    }

    console.log(`Cancelling payment link for order ${order.id}`);

    const paymentLink =
      order.stripePaymentLink as unknown as Stripe.PaymentLink;

    await stripe.paymentLinks.update(paymentLink.id, {
      active: false,
    });

    await prisma.imageOrder.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "cancelled",
      },
    });
  }

  return NextResponse.json({
    message: "ok",
  });
}
