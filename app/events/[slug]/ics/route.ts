import { getApprovedEvent } from "@/lib/events-data";
import { toIcs } from "@/lib/events";

// Calendar download. 404 for unknown, unpublished or unconfirmed-date events (toIcs returns null).
export async function GET(_request: Request, ctx: RouteContext<"/events/[slug]/ics">) {
  const { slug } = await ctx.params;
  const event = await getApprovedEvent(slug);
  const ics = event ? toIcs(event) : null;
  if (!ics) return new Response("Not found", { status: 404 });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
