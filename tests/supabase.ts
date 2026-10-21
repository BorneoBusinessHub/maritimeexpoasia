import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Test helpers. Tests run against the real Supabase project and clean up what they create.
const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing. Add it to .env.local (see .env.example).`);
  return value;
}

export const anon = (): SupabaseClient => createClient(need("SUPABASE_URL"), need("SUPABASE_ANON_KEY"), OPTIONS);

export const service = (): SupabaseClient =>
  createClient(need("SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), OPTIONS);

// Creates a confirmed user (optionally listed in `admins`) and returns a client signed in as them.
export async function signedInAs(email: string, admin: boolean) {
  const svc = service();
  const password = randomUUID();
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  if (admin) {
    const { error: e } = await svc.from("admins").insert({ email });
    if (e) throw e;
  }
  const client = anon();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return {
    client,
    cleanup: async () => {
      if (admin) await svc.from("admins").delete().eq("email", email);
      await svc.auth.admin.deleteUser(data.user.id);
    },
  };
}
