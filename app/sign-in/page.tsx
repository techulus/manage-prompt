import { SignUp } from "@clerk/nextjs/app-beta";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
