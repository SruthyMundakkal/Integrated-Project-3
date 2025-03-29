"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Add client-side navigation after sign out
      router.push('/sign-in');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSignOut}
      className="text-white hover:text-white/80"
    >
      <LogOut size={16} className="mr-2" />
      Sign Out
    </Button>
  );
}
