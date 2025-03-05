import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { SITE_METADATA } from "@/data/marketing";
import promoImage from "@/public/images/promo.png";
import workflowImage from "@/public/images/workflow.png";
import { CloudCog, GitBranch, LockIcon, ServerCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    name: "Deploy instantly.",
    description:
      "You can tweak prompts, update models, and deliver changes to your users instanty.",
    icon: CloudCog,
  },
  {
    name: "Iterate quickly.",
    description:
      "Branches and tests lets you evaluate several variants of your prompt and models.",
    icon: GitBranch,
  },
  {
    name: "Security controls.",
    description:
      "Filter and control malicious requests with our security features such as single use tokens and rate limiting.",
    icon: LockIcon,
  },
  {
    name: "Several models to choose from.",
    description:
      "Use multiple models using the same API, models from OpenAI, Meta, Google, Mixtral and Anthropic.",
    icon: ServerCog,
  },
];

export default async function Home() {
  return (
    <div className="h-full">
      <Header />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-500 dark:from-blue-400 dark:to-red-400 sm:text-7xl">
                {SITE_METADATA.TAGLINE}
              </h1>
              <p className="mt-8 text-pretty text-lg font-medium text-gray-500 dark:text-gray-300 sm:text-xl/8">
                {SITE_METADATA.DESCRIPTION}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/workflows"
                  className={buttonVariants({ variant: "default" })}
                  prefetch={false}
                >
                  Get started
                </Link>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/techulus/manage-prompt"
                  className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
                >
                  View on GitHub <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 dark:bg-gray-700 p-2 ring-1 ring-inset ring-gray-600 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  alt="App screenshot"
                  src={workflowImage}
                  width={2432}
                  height={1442}
                  className="rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:ring-gray-600"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#2563eb] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden bg-secondary dark:bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-primary">
                  Build faster
                </h2>
                <p className="mt-2 text-3xl tracking-tighter text-accent-foreground sm:text-4xl font-bold text-hero">
                  Building blocks for your next AI project
                </p>
                <p className="mt-6 text-lg leading-8 text-foreground">
                  We provide the tools to help you build and deploy your AI
                  projects faster. We take care of the infrastructure so you can
                  focus on what you do best.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-accent-foreground lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-foreground">
                        <feature.icon
                          className="absolute left-1 top-1 h-5 w-5 text-primary"
                          aria-hidden="true"
                        />
                        {feature.name}
                      </dt>{" "}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <Image
              src={promoImage}
              alt="Product screenshot"
              className="w-[56rem] max-w-none shadow-xl ring-1 ring-white/10 sm:w-[64rem] md:-ml-4 lg:-ml-0"
            />
          </div>
        </div>
      </div>

      <Footer isHome />
    </div>
  );
}
