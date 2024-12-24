import type { Metadata } from "next";
import { getAppBaseUrl } from "./url";

export function buildMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    metadataBase: new URL(getAppBaseUrl()),
  };
}
