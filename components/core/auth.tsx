"use client";
import { signOut } from "@/lib/auth-client";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const UserButton = () => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/settings" className="w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="https://techulus.atlassian.net/servicedesk/customer/portal/5"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            type="button"
            onClick={() =>
              toast.promise(
                signOut().then(() => router.push("/")),
                {
                  loading: "Signing out...",
                  success: "Signed out successfully",
                  error: "Failed to sign out",
                },
              )
            }
          >
            Sign Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
