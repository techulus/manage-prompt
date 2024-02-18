import { Suspense } from "react";

export async function Reader({
  reader,
}: {
  reader: ReadableStreamDefaultReader<any>;
}) {
  const { done, value } = await reader.read();

  if (done) {
    return null;
  }

  const text = new TextDecoder().decode(value);

  return (
    <span>
      {text}
      <Suspense>
        {
          // @ts-ignore React server component}
          <Reader reader={reader} />
        }
      </Suspense>
    </span>
  );
}
