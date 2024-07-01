import { SignedIn } from "@clerk/nextjs";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { buttonVariants } from "../ui/button";

interface Props {
  title: string;
  subTitle?: string;
  actionLink?: string;
  actionLabel?: string;
  backUrl?: string;
}

export default function PageTitle({
  title,
  subTitle,
  backUrl,
  actionLink,
  actionLabel,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="flex justify-center border-b pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:px-8 xl:py-10 dark:text-white bg-gray-50 dark:bg-card">
      <div className="flex w-full justify-between max-w-7xl">
        <div className="flex items-center">
          {backUrl && (
            <SignedIn>
              <Link
                href={backUrl}
                className="flex items-center text-md font-medium text-gray-600 hover:text-gray-900 mr-2"
              >
                <ArrowLeftIcon
                  className={classNames(
                    "flex-shrink-0 h-6 w-6 text-gray-600 hover:text-gray-900",
                    "dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                  aria-hidden="true"
                />
              </Link>
            </SignedIn>
          )}

          <div className="flex flex-col">
            <h1 className="flex-1 text-2xl text-heading">{title}</h1>
            {subTitle ? (
              <p className="text-gray-500 dark:text-gray-400">{subTitle}</p>
            ) : null}
            {children}
          </div>
        </div>

        {actionLink && actionLabel ? (
          <Link href={actionLink} className={buttonVariants()}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
