"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const NOTICE: Record<string, string> = {
  "not-admin": "That account is not an admin.",
  link: "That sign-in link did not work. Please request a new one.",
};

export default function LoginForm() {
  const error = useSearchParams().get("error");
  const [message, setMessage] = useState(error ? (NOTICE[error] ?? "") : "");
  const [sent, setSent] = useState(false);

  async function submit(form: FormData) {
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    // shouldCreateUser: false so strangers cannot create accounts by typing an email.
    const { error: err } = await createBrowserSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/admin/auth/callback` },
    });
    const rateLimited = err?.status === 429;
    setSent(!rateLimited);
    // Same message for known and unknown emails, so the form does not reveal who is an admin.
    setMessage(
      rateLimited
        ? "Too many requests. Please wait a minute and try again."
        : "If that email is an admin, a sign-in link is on its way.",
    );
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full rounded-2xl bg-white px-4 py-3 ring-1 ring-ink/15 focus:outline-none focus:ring-2 focus:ring-navy"
      />
      <button className="rounded-full bg-deep px-6 py-3 font-semibold text-white hover:bg-navy" disabled={sent}>
        Send sign-in link
      </button>
      {message && (
        <p role="status" className="text-sm text-ink/80">
          {message}
        </p>
      )}
    </form>
  );
}
