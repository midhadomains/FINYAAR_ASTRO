import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://finyaar.com");
  const sitemapUrl = new URL("sitemap-index.xml", origin);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /internal/",
    "",
    `Sitemap: ${sitemapUrl.href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
