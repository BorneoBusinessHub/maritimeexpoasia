"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { eventHref, formatDates, type MaritimeEvent } from "@/lib/events";

// Events in the same city share one pin; its popup lists them all.
function groupByPlace(events: MaritimeEvent[]) {
  const groups = new Map<string, MaritimeEvent[]>();
  for (const e of events) {
    if (e.latitude === null || e.longitude === null) continue;
    const key = `${e.latitude},${e.longitude}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups.values()];
}

// Popup is built from DOM nodes and textContent, never HTML strings, so event names cannot inject markup.
function popupFor(group: MaritimeEvent[]): HTMLElement {
  const root = document.createElement("div");
  group.forEach((e, i) => {
    const block = document.createElement("div");
    if (i > 0) block.style.marginTop = "0.6rem";
    const link = document.createElement("a");
    link.href = eventHref(e);
    link.textContent = e.name;
    link.style.fontWeight = "600";
    const when = document.createElement("div");
    when.textContent = formatDates(e);
    const where = document.createElement("div");
    where.textContent = `${e.city}, ${e.country}`;
    block.append(link, when, where);
    root.append(block);
  });
  return root;
}

export default function EventMap({ events }: { events: MaritimeEvent[] }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const points: L.LatLngTuple[] = [];
    for (const group of groupByPlace(events)) {
      const pos: L.LatLngTuple = [group[0].latitude!, group[0].longitude!];
      points.push(pos);
      const colour = group.some((e) => e.tier !== "listed") ? "#b45309" : "#1f4e79";
      L.circleMarker(pos, { radius: 9, color: colour, fillColor: colour, fillOpacity: 0.85, weight: 2 })
        .bindPopup(popupFor(group))
        .addTo(map);
    }
    if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 5 });
    else map.setView([20, 100], 2);

    return () => {
      map.remove();
    };
  }, [events]);

  return (
    <div
      ref={container}
      role="region"
      aria-label="Map of events"
      className="h-[28rem] w-full overflow-hidden rounded-[2rem] ring-1 ring-ink/10 sm:h-[34rem]"
    />
  );
}
