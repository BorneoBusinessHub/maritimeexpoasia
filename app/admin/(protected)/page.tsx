import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-3xl font-semibold text-deep">Admin</h1>
      <ul className="list-disc pl-6">
        <li>
          <Link href="/admin/events" className="underline underline-offset-4">
            Events calendar
          </Link>
        </li>
      </ul>
    </div>
  );
}
