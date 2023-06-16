import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";

export default async function Writer() {
  return (
    <>
      <PageTitle
        title="Writer"
        createLink="/console/writer/new"
        createLabel="New Page"
      />

      <ContentBlock>WIP</ContentBlock>
    </>
  );
}
