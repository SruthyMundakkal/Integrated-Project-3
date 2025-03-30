import LoginForm from "@/components/auth/LoginForm";
import { Message } from "@/components/form-message";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Message>;
}) {
  // Resolve the promise at the page level
  const resolvedParams = await searchParams;
  
  return (
    <main className="flex flex-col p-6 bg-muted rounded-lg shadow-md mx-auto">
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          <LoginForm searchParams={resolvedParams} />
      </div>
    </main>
  );
}
