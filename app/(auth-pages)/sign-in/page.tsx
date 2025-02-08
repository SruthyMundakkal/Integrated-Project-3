import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
  <form className="flex-1 flex flex-col min-h-24 bg-[#7398B7] min-h-screen">
  <nav className="bg-[#004477] text-white py-8">
    <div className="container mx-auto flex items-center">
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="h-20 w-auto mr-4 object-cover object-center"
      />
    </div>
  </nav>

  <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
    <div className="w-full max-w-md bg-[#9BB1D2] rounded-lg shadow-lg p-6">
      <div className="flex justify-center mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Sign in</h1>
          <p className="mt-2 text-blue-800 font-semibold">Employee Claims System</p>
          <p className="text-sm text-foreground">
            Don't have an account?{" "}
            <Link className="text-foreground font-medium underline" href="/sign-up">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-1">
          Email
        </Label>
        <Input name="email" placeholder="you@example.com" required className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-1">
            Password
          </Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </div>
  </div>
</form>

  );
}
