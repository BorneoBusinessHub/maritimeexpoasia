"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconBadge, pill } from "@/components/pill";

const LINKS = [
  { href: "/", label: "Expo 2027" },
  { href: "/summit-2027", label: "March Summit" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

// Floating glass island. On phones the hamburger morphs to an X and opens a full-screen menu.
export default function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const line = "absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-white transition-all duration-700 ease-fluid";

  return (
    <>
      <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full bg-white/80 py-2 pl-6 pr-2 shadow-[0_12px_40px_-16px_rgba(12,39,64,0.3)] ring-1 ring-ink/10 backdrop-blur-xl">
          {/* Text wordmark until a logo is supplied [TBC] */}
          <Link href="/" onClick={() => setOpen(false)} className="font-display text-lg font-semibold tracking-tight text-deep">
            Maritime Expo Asia
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={path === l.href || (l.href !== "/" && path.startsWith(`${l.href}/`)) ? "page" : undefined}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition-colors duration-500 ease-fluid hover:text-deep aria-[current=page]:bg-deep/5 aria-[current=page]:text-deep"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#register" className={`${pill("primary")} ml-2 py-1 pl-4 pr-1 text-sm`}>
              Register
              <IconBadge />
            </Link>
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="relative size-10 rounded-full bg-deep md:hidden"
          >
            <span className={`${line} ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
            <span className={`${line} ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        inert={!open}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-deep/90 px-8 backdrop-blur-3xl transition-opacity duration-700 ease-fluid md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-3">
          {[...LINKS, { href: "/#register", label: "Register interest" }].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
              className={`font-display text-5xl font-semibold tracking-tight text-white transition-all duration-700 ease-fluid ${
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
