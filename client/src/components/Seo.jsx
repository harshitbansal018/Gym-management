import { useEffect } from "react";

// Per-page SEO without an SSR framework: imperatively updates the document title
// and meta/OG/Twitter tags (and optional JSON-LD) when a page mounts. Pairs with
// the static defaults in index.html for crawlers/initial paint.
const SITE_NAME = "FitManager";
const DEFAULT_DESCRIPTION =
  "FitManager is all-in-one gym management software — manage members, plans, payments, attendance, renewals, and trainers from one simple dashboard.";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({ title, description = DEFAULT_DESCRIPTION, path, image, type = "website", noindex = false, jsonLd }) {
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Gym Management Software`;
    document.title = fullTitle;

    const origin = window.location.origin;
    const url = origin + (path || window.location.pathname);

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    if (image) upsertMeta("property", "og:image", image);

    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    if (image) upsertMeta("name", "twitter:image", image);

    // Structured data (JSON-LD) — replace any previous block.
    document.getElementById("seo-jsonld")?.remove();
    if (jsonLdStr) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "seo-jsonld";
      script.text = jsonLdStr;
      document.head.appendChild(script);
    }
  }, [title, description, path, image, type, noindex, jsonLdStr]);

  return null;
}
