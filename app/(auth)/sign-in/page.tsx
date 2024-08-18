"use client";

import { createToastWrapper } from "@/components/core/toast";
import { ActionButton } from "@/components/form/button";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { login } from "../actions";

export default function SignInForm() {
  return (
    <div className="m-6 flex h-full items-center justify-center">
      <Header />
      {createToastWrapper("dark")}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-hero text-4xl">Get Started</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <form
              action={(formData) => {
                toast.promise(login(formData), {
                  loading: "Logging in...",
                  success: "Logged in!",
                  error: "Failed to log in.",
                });
              }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@manageprompt.com"
                name="email"
                required
              />

              <ActionButton
                variant="default"
                className="mt-2 w-full"
                label="Sign in"
                loadingLabel="Logging in..."
              />
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
