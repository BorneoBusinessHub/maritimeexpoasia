import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

const NAV = [{ href: "/admin/events", label: "Events" }];

async function Guard({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
        <nav className="flex gap-5 text-base font-medium">
          <Link href="/admin" className="text-deep">
            Admin
          </Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/70 hover:text-deep">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="flex items-center gap-3 text-sm text-ink/60">
          {email}
          <button className="rounded-full px-4 py-1.5 ring-1 ring-ink/20 hover:bg-white">Sign out</button>
        </form>
      </header>
      {children}
    </div>
  );
}

// cookies() is runtime data, so the guarded part streams inside Suspense (Cache Components).
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="px-4 sm:px-8">Loading…</p>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
