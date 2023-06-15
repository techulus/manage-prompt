import PageTitle from "@/components/layout/page-title";
import { auth } from "@clerk/nextjs/app-beta";

export const dynamic = "force-dynamic";

export default async function Writer() {
  const { userId, orgId } = auth();

  return (
    <>
      <PageTitle
        title="Writer"
        createLink="/console/writer/new"
        createLabel="New Page"
      />
    </>
  );
}
