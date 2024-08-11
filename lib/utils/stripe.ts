import { prisma } from "@/lib/utils/db";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createOrRetrieveCustomer(
  ownerId: string,
): Promise<string> {
  const organization = await prisma.organization.findUnique({
    include: {
      stripe: true,
    },
    where: {
      id: ownerId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (organization?.stripe?.customerId) {
    return organization?.stripe?.customerId;
  }

  const customer = await stripe.customers.create({
    name: organization.name ?? "",
    metadata: {
      organizationId: organization?.id,
    },
  });

  await prisma.stripe.create({
    data: {
      organization: {
        connect: {
          id: organization?.id,
        },
      },
      customerId: customer.id,
    },
  });

  return customer.id;
}

export async function getCheckoutSession(customerId: string): Promise<string> {
  const stripeCustomer = await prisma.stripe.findUnique({
    where: {
      customerId,
    },
  });

  if (
    stripeCustomer?.subscriptionId &&
    !isSubscriptionCancelled(stripeCustomer?.subscription)
  ) {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_BASE_URL}/console/settings`,
    });

    return url;
  }

  const { url } = await stripe.checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price: process.env.STRIPE_WORKFLOW_RUN_PRICE_ID,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.APP_BASE_URL}/console/settings?payment_success=true`,
    cancel_url: `${process.env.APP_BASE_URL}/console/settings?payment_canceled=true`,
  });

  return url;
}

export async function reportUsage(
  ownerId: string,
  subscription: Stripe.Subscription | null,
  quantity: number,
) {
  if (!ownerId) {
    throw new Error("[reportUsage]: Owner ID not found");
  }
  if (!isSubscriptionActive(subscription)) {
    await prisma.organization.update({
      where: {
        id: ownerId,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });
    return;
  }

  if (!subscription) {
    throw new Error("[reportUsage]: Subscription not found");
  }

  console.log(
    `Report usage for subscription ${subscription.id}, quantity ${quantity}`,
  );
  const item = subscription.items?.data.find(
    (item) => item.price.id === process.env.STRIPE_WORKFLOW_RUN_PRICE_ID,
  );

  if (!item) {
    throw new Error("Subscription item not found");
  }

  const timestamp = parseInt(`${Date.now() / 1000}`);

  await stripe.subscriptionItems.createUsageRecord(
    item.id,
    {
      quantity,
      timestamp: timestamp,
      action: "increment",
    },
    {
      idempotencyKey: `${subscription.id}-${createId()}`,
    },
  );
}

export function isSubscriptionActive(subscription: any) {
  return ["trialing", "active"].includes(subscription?.status);
}

export function isSubscriptionCancelled(subscription: any) {
  return subscription?.status === "canceled";
}

export async function getUpcomingInvoice(
  customer: string,
): Promise<Stripe.Invoice | null> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer,
    });
    return invoice;
  } catch (error: any) {
    if (error?.statusCode !== 404) {
      console.error("Failed to get invoice for cutsomer: ", customer, error);
    }
    return null;
  }
}

export async function hasExceededSpendLimit(
  spendLimit: number | null | undefined,
  stripeCustomerId: string | null | undefined,
): Promise<boolean> {
  if (spendLimit && stripeCustomerId) {
    const invoice = await getUpcomingInvoice(stripeCustomerId);
    if (!invoice) return false;
    return invoice.amount_due / 100 > spendLimit;
  }
  return false;
}
