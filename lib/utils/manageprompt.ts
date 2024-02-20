export async function getManagePromptToken(ttl: number = 60) {
  const { token } = await fetch(
    `${process.env.APP_BASE_URL}/api/v1/token?ttl=${ttl}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MANAGEPROMPT_SECRET_TOKEN}`,
      },
      cache: "no-store",
    }
  ).then((res) => res.json());

  return token;
}
