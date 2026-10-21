import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link landing: swaps the one-time code for a session, then opens the admin.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/admin", url.origin));
  }
  return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
}
