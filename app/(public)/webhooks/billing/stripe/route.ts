import { prisma } from "@/lib/utils/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function GET(_: Request) {
  return new Response("Hello!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = (await headers()).get("stripe-signature");

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "customer.subscription.created": {
        const createdSubscription: Stripe.Subscription = event.data.object;
        await prisma.stripe.update({
          where: {
            customerId: String(createdSubscription.customer),
          },
          data: {
            subscriptionId: createdSubscription.id,
            subscription: JSON.parse(JSON.stringify(createdSubscription)),
          },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const updatedSubscription: Stripe.Subscription = event.data.object;
        await prisma.stripe.update({
          where: {
            subscriptionId: updatedSubscription.id,
          },
          data: {
            subscriptionId: updatedSubscription.id,
            subscription: JSON.parse(JSON.stringify(updatedSubscription)),
          },
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`, event);
        break;
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "something went wrong",
        ok: false,
      },
      { status: 500 },
    );
  }
}
