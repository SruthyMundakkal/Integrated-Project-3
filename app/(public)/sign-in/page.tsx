import LoginForm from "@/components/auth/LoginForm";
import { Message } from "@/components/form-message";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Message>;
}) {
  return (
    <main>
      <LoginForm searchParams={searchParams} />
    </main>
  );
}
