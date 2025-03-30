import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div >
      
      
    </div>
  );
}


