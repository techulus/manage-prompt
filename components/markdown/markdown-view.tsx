// @ts-nocheck
import Markdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function MarkdownView({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <Prism style={oneDark} PreTag="div" language={match[1]} {...props}>
              {String(children).replace(/\n$/, "")}
            </Prism>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
      className="prose dark:prose-invert max-w-none prose-a:text-primary overflow-hidden -mt-[16px]"
    >
      {content}
    </Markdown>
  );
}
