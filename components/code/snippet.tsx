import { useState } from "react";
import "./styles.css";

// @ts-expect-error Types are missing
import { CodeSnippet } from "react-apiembed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function ApiCodeSnippet({ har }: { har: unknown }) {
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
      <Select
        value={selectedLanguage.language}
        onValueChange={(value) =>
          setSelectedLanguage(
            languages.find(({ language }) => language === value) ??
              languages[0],
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.language} value={lang.language}>
              {lang.language}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 overflow-scroll">
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
