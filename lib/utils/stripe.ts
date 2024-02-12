import { prisma } from "@/lib/utils/db";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createOrRetrieveCustomer(
  ownerId: string
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
