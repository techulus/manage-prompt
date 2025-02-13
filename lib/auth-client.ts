import { magicLinkClient, passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  plugins: [magicLinkClient(), passkeyClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
