import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/utils/metadata";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
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
    {
      title: "Photo Colorizer",
      description:
        "Colorize your black and white photos using AI to bring them to life.",
      href: "/ai-tools/black-and-white-to-color",
    },
    {
      title: "Photo Realistic Image Creator",
      description:
        "Create photo realistic images using AI to generate images from text.",
      href: "/ai-tools/photo-realistic-image-creator",
    },
    {
      title: "Image Upscaling",
      description:
        "Upscale your images using AI to enhance the details and sharpness.",
      href: "/ai-tools/image-upscale",
    },
    {
      title: "Remove Background",
      description: "Use AI to remove the background from your images.",
      href: "/ai-tools/remove-background",
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
        <div className="divide-y overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-900 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
          {actions.map((action, actionIdx) => (
            <div
              key={action.title}
              className={cn(
                actionIdx === 0
                  ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
                  : "",
                actionIdx === 1 ? "sm:rounded-tr-lg" : "",
                actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
                actionIdx === actions.length - 1
                  ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
                  : "",
                "group relative bg-white dark:bg-slate-950 p-6 focus-within:ring-2 focus-within:ring-inset  focus-within:ring-primary"
              )}
            >
              <div className="mt-8">
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
              <span
                className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-primary"
                aria-hidden="true"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
