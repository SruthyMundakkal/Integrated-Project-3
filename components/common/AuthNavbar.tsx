import Link from "next/link";
import { SignOutButton } from "../auth/SignOutButton";
import { ThemeSwitcher } from "../theme-switcher";

export function AuthNavbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/dashboard"}>Employee Claims System-ECS</Link>
        </div>
        <div className="flex items-center gap-4">
          <SignOutButton />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}

export default AuthNavbar;