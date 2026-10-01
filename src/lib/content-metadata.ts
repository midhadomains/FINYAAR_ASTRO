import contentDates from "../data/content-dates.json";
import { organizationSchema } from "./seo";

export interface ContentDates { datePublished: string; dateModified: string }

// Dates are editorial metadata, seeded from recorded Git history (not deployment time).
// Update dateModified when editing content; confirm datePublished if a launch date is known.
export function getContentDates(path: string): ContentDates {
  const key = `/${path.split("/").filter(Boolean).join("/")}/`.replace("//", "/");
  const dates = (contentDates as Record<string, ContentDates>)[key];
  if (!dates || !Number.isFinite(Date.parse(dates.datePublished)) || !Number.isFinite(Date.parse(dates.dateModified)) || Date.parse(dates.dateModified) < Date.parse(dates.datePublished)) {
    throw new Error(`Missing or invalid editorial dates for ${key}. Update src/data/content-dates.json.`);
  }
  return dates;
}

export function contentSchemaMetadata(url: URL) {
  return { author: organizationSchema(url), ...getContentDates(url.pathname) };
}
