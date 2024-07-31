"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  await signIn("postmark", formData);
}

export async function logout() {
  await signOut();
  redirect("/");
}
