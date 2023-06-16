"use client";

import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";

export default async function Writer() {
  return (
    <>
      <PageTitle title="New Page" backUrl="/console/writer" />

      <ContentBlock></ContentBlock>
    </>
  );
}
