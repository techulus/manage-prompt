"use client";

import { ContentBlock } from "@/components/core/content-block";
import { EDITOR_JS_TOOLS } from "@/components/editor/tools";
import PageTitle from "@/components/layout/page-title";
import { createReactEditorJS } from "react-editor-js";

export default async function Writer() {
  const ReactEditorJS = createReactEditorJS();

  return (
    <>
      <PageTitle title="New Page" backUrl="/console/writer" />

      <ContentBlock>
        <ReactEditorJS tools={EDITOR_JS_TOOLS} />
      </ContentBlock>
    </>
  );
}
