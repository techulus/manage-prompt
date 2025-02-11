import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/utils/metadata";
import { MagicWandIcon } from "@radix-ui/react-icons";
import type { Metadata } from "next";
import Link from "next/link";

const title = "Free AI Tools";
const description =
  "Here are some free AI tools that you can use to improve your productivity.";

export const metadata: Metadata = buildMetadata(title, description);

export default async function FreeAiTools() {
  const actions = [
    {
      title: "Proof Reading",
      description:
        "Use AI to proofread your text and correct any grammatical errors.",
      href: "/ai-tools/proof-reading",
    },
    {
      title: "Summarise Text",
      description:
        "Use AI to summarise your text and generate a short summary.",
      href: "/ai-tools/summarise-text",
    },
  ];

  return (
    <>
      <PageTitle title={title} subTitle={description}>
        <div className="flex">
          <Button variant="link" className="px-0">
            <MagicWandIcon
              className="mr-3 h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <Link href="/" prefetch={false}>
              Build Your Own AI Tools Using ManagePrompt
            </Link>
          </Button>
        </div>
      </PageTitle>

      <PageSection topInset>
        <div className="divide-y overflow-hidden bg-slate-200 dark:bg-slate-900 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
          {actions.map((action) => (
            <div
              key={action.title}
              className={cn(
                "group relative bg-white dark:bg-slate-950 p-6 focus-within:ring-2 focus-within:ring-inset  focus-within:ring-primary"
              )}
            >
              <h3 className="text-xl font-semibold leading-6">
                <Link
                  prefetch={false}
                  href={action.href}
                  className="focus:outline-none"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </Link>
              </h3>
              <p className="mt-2 text-md text-gray-500 dark:text-gray-300">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
