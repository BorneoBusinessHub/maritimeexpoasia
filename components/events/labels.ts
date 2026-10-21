import type { Category, Region } from "@/lib/events";

export const REGION_LABELS: Record<Region, string> = {
  asia_pacific: "Asia Pacific",
  europe: "Europe",
  middle_east_africa: "Middle East and Africa",
  americas: "Americas",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  exhibition: "Exhibition",
  conference: "Conference",
  exhibition_conference: "Exhibition and conference",
};
