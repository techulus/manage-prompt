import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";

// @ts-expect-error Types are missing
import { CodeSnippet } from "react-apiembed";

export function ApiCodeSnippet({ har }: { har: any }) {
  const languages = [
    {
      language: "javascript",
      client: "fetch",
    },
    {
      language: "shell",
      client: "curl",
    },
    {
      language: "go",
    },
    {
      language: "python",
    },
    {
      language: "ruby",
    },
    {
      language: "java",
    },
    {
      language: "swift",
    },
    {
      language: "php",
    },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <div className="mt-4">
      {languages.map(({ language, client }) => (
        <Button
          type="button"
          key={language}
          variant="ghost"
          className={cn(
            language === selectedLanguage.language && "text-primary font-bold"
          )}
          onClick={() => setSelectedLanguage({ language, client })}
        >
          {language}
        </Button>
      ))}

      <div className="bg-secondary mt-4 p-4 overflow-scroll rounded-md">
        <CodeSnippet
          key={selectedLanguage.language}
          har={har}
          prismLanguage={selectedLanguage.language}
          target={selectedLanguage.language}
          client={selectedLanguage.client}
        />
      </div>
    </div>
  );
}
