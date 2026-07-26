import { useEffect } from "react";

const SITE_NAME = "Your Community Hub";
const SITE_ORIGIN = "https://hub4community.com";
const DEFAULT_TITLE = `${SITE_NAME} – Local business, club & event directory for Ireland`;
const DEFAULT_DESCRIPTION = "Find local businesses, clubs, events and resources in your town. Your Community Hub connects people across Ireland — starting in Bandon and West Cork.";
const DEFAULT_IMAGE = "https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png";
const JSONLD_ID = "page-jsonld";

function upsertMeta(attr, key, content) {
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

/**
 * Sets document.title plus dynamic meta description, canonical URL, Open Graph
 * and Twitter tags, and optional JSON-LD structured data for the page.
 *
 * Pass `path` ("/directory", "/listing/123", ...) for a per-page canonical URL.
 * Pass `schema` (a JSON-LD object) to emit structured data for rich results.
 */
export default function usePageTitle(title, { description, image, path, schema } = {}) {
  // schema may be a new object each render — normalise to a stable string dep
  const schemaJson = schema ? JSON.stringify(schema) : "";
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const url = path ? `${SITE_ORIGIN}${path}` : `${SITE_ORIGIN}/`;

    upsertLink("canonical", url);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:url", url);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "description", desc);
    upsertMeta("property", "og:description", desc);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("property", "og:image", img);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:card", "summary_large_image");

    // JSON-LD structured data — replace or remove the per-page script
    let script = document.getElementById(JSONLD_ID);
    if (schemaJson) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = JSONLD_ID;
        document.head.appendChild(script);
      }
      script.textContent = schemaJson;
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, path, schemaJson]);
}