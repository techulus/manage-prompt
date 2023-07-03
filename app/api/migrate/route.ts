import { prisma } from "@/lib/utils/db";
import { clerkClient } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";

export async function GET() {
  const users = await clerkClient.users.getUserList();
  for (const data of users) {
    try {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data.emailAddresses[0].emailAddress,
          first_name: data.firstName,
          last_name: data.lastName,
          rawData: data as unknown as Prisma.JsonObject,
        },
      });
      await prisma.organization.create({
        data: {
          id: data.id,
          name: "Personal",
          image_url: data.imageUrl,
          logo_url: data.imageUrl,
          rawData: data as unknown as Prisma.JsonObject,
          createdBy: {
            connect: {
              id: data.id,
            },
          },
        },
      });
    } catch (e) {
      continue;
    }
  }

  const orgs = await clerkClient.organizations.getOrganizationList();
  for (const data of orgs) {
    try {
      await prisma.organization.create({
        data: {
          id: data.id,
          name: data.name,
          image_url: data.imageUrl,
          logo_url: data.logoUrl,
          rawData: data as unknown as Prisma.JsonObject,
          createdBy: {
            connect: {
              id: data.createdBy,
            },
          },
        },
      });
    } catch (e) {
      continue;
    }
  }

  const workflows = await prisma.workflow.findMany();
  for (const data of workflows) {
    const org = await prisma.organization.findFirst({
      where: {
        id: data.ownerId,
      },
    });

    try {
      await prisma.workflow.update({
        where: {
          id: data.id,
        },
        data: {
          createdBy: org?.createdByUser,
        },
      });
    } catch (e) {
      continue;
    }
  }

  const workflowRuns = await prisma.workflowRun.findMany();
  for (const data of workflowRuns) {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: data.workflowId,
      },
    });
    const org = await prisma.organization.findFirst({
      where: {
        id: workflow?.ownerId,
      },
    });

    try {
      await prisma.workflowRun.update({
        where: {
          id: data.id,
        },
        data: {
          createdBy: org?.createdByUser,
        },
      });
    } catch (e) {
      continue;
    }
  }

  return new Response("Done");
}
