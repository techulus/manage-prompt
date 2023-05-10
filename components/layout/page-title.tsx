import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

interface Props {
  title: string;
  showBackButton?: boolean;
}

export default function PageTitle({ title, showBackButton }: Props) {
  return (
    <div className="border-b border-t border-gray-200 pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:pl-6 xl:pt-6">
      <div className="flex items-center">
        {showBackButton && (
          <Link
            href="/console/workflows"
            className="flex items-center text-md font-medium text-gray-600 hover:text-gray-900 mr-2"
          >
            <ArrowLeftIcon
              className="flex-shrink-0  h-6 w-6 text-gray-600 hover:text-gray-900"
              aria-hidden="true"
            />
          </Link>
        )}

        <h1 className="flex-1 text-lg font-semibold hero">{title}</h1>
      </div>
    </div>
  );
}
