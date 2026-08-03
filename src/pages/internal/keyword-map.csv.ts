import type { APIRoute } from "astro";
import { keywordMap } from "../../lib/seo";

export const prerender = true;

const columns = [
  "url", "page_type", "primary_keyword", "search_intent", "market", "stage", "priority",
  "monthly_volume", "keyword_difficulty", "research_status", "research_source",
] as const;

function csvCell(value: string | number | null): string {
  const valueText = value === null ? "" : String(value);
  return `"${valueText.replaceAll('"', '""')}"`;
}

export const GET: APIRoute = () => {
  const rows = keywordMap.map((target) => [
    target.url, target.pageType, target.primaryKeyword, target.searchIntent, target.market,
    target.stage, target.priority, target.monthlyVolume, target.keywordDifficulty,
    target.researchStatus, target.researchSource,
  ]);
  const body = [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="finyaar-keyword-to-url-map.csv"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};
