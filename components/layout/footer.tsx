import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";

const navigation = {
  solutions: [
    { name: "Workflows", href: "/workflows" },
    { name: "Chatbots", href: "/chatbots" },
    {
      name: "Zapier Integration",
      href: "https://zapier.com/developer/public-invite/217847/c90f089190b5e742f49cbef29910800f/",
    },
    { name: "Free AI Tools", href: "/ai-tools" },
  ],
  tools: [
    {
      name: "Proof Reading",
      href: "/ai-tools/proof-reading",
    },
    {
      name: "Summarise Text",
      href: "/ai-tools/summarise-text",
    },
  ],
  project: [
    { name: "Source code", href: "https://github.com/techulus/manage-prompt" },
    {
      name: "Support",
      href: "https://techulus.atlassian.net/servicedesk/customer/portal/5",
    },
    {
      name: "Documentation",
      href: "https://manageprompt.readme.io",
    },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/techulus",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/techulus",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export function Footer({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className={cn(isHome ? "mt-24" : "")}>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Image
              src={logo}
              alt="ManagePrompt"
              width={32}
              height={32}
              className="h-8"
            />
            <p className="text-sm leading-6">Powered by AI</p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-400"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Solutions</h3>
                <ul className="mt-6 space-y-1">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-700 dark:text-gray-300 hover:text-black hover:dark:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">
                  Free AI Tools
                </h3>
                <ul className="mt-6 space-y-1">
                  {navigation.tools.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-700 dark:text-gray-300 hover:text-black hover:dark:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">Project</h3>
                <ul className="mt-6 space-y-1">
                  {navigation.project.map((item) => (
                    <li key={item.name}>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={item.href}
                        className="text-sm leading-6 text-gray-700 dark:text-gray-300 hover:text-black hover:dark:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">Legal</h3>
                <ul className="mt-6 space-y-1">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-700 dark:text-gray-300 hover:text-black hover:dark:text-white"
                        prefetch={false}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Techulus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
