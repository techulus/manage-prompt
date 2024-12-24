import { unstable_noStore } from "next/cache";

export async function getManagePromptToken(ttl = 60) {
  unstable_noStore();
  const { token } = await fetch(
    `${process.env.APP_BASE_URL}/api/v1/token?ttl=${ttl}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MANAGEPROMPT_SECRET_TOKEN}`,
      },
      cache: "no-store",
    },
  ).then((res) => res.json());

  return token;
}
