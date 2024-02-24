import { MetadataRoute } from "next";

const aiToolsRoutes = [
  "proof-reading",
  "summarise-text",
  "black-and-white-to-color",
  "image-upscale",
  "remove-background",
  "photo-realistic-image-creator",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://manageprompt.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://manageprompt.com/sign-in",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://manageprompt.com/sign-up",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://manageprompt.com/ai-tools",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...aiToolsRoutes.map<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
      priority?: number;
    }>((route: string) => ({
      url: `https://manageprompt.com/ai-tools/${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
