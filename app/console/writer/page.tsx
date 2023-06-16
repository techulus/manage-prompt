import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";

export default async function Writer() {
  return (
    <>
      <PageTitle
        title="Writer"
        actionLabel="New Page"
        actionLink="/console/writer/new"
      />

      <ContentBlock>WIP</ContentBlock>
    </>
  );
}
