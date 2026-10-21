import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Signed in AND listed in `admins` (checked by the database through is_admin()). Otherwise sends to login.
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");
  const { data } = await supabase.rpc("is_admin");
  if (data !== true) redirect("/admin/login?error=not-admin");
  return { email: user.email };
}
