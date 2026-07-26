import { useEffect } from "react";

const SITE_NAME = "Your Community Hub";
const DEFAULT_TITLE = `${SITE_NAME} – Local business, club & event directory for Ireland`;
const DEFAULT_DESCRIPTION = "Find local businesses, clubs, events and resources in your town. Your Community Hub connects people across Ireland — starting in Bandon and West Cork.";
const DEFAULT_IMAGE = "https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets document.title plus dynamic meta description / Open Graph / Twitter tags.
 * Backward compatible: call with just a title string (old behaviour) —
 * defaults are used for description and image.
 */
export default function usePageTitle(title, { description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;

    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "description", desc);
    setMeta("property", "og:description", desc);
    setMeta("name", "twitter:description", desc);
    setMeta("property", "og:image", img);
    setMeta("property", "og:type", "website");
  }, [title, description, image]);
}