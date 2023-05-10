import { SignIn } from "@clerk/nextjs/app-beta";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
