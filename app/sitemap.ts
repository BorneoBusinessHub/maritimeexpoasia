import type { MetadataRoute } from "next";

const BASE = "https://maritimeexpoasia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/summit-2027", "/contact", "/privacy"].map((p) => ({ url: BASE + p }));
}
