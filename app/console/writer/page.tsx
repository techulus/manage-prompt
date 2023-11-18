import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { Editor } from "novel";

// TODO: disable image upload

export default async function Writer() {
  return (
    <>
      <PageTitle title="Writer" />

      <ContentBlock>
        <Editor
          className="max-w-7xl"
          defaultValue={{
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Hello!" }],
              },
            ],
          }}
        />
      </ContentBlock>
    </>
  );
}
