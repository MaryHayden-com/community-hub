import { useEffect } from "react";

const SITE_NAME = "Community Hub";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Local Directory for Bandon, West Cork`;
  }, [title]);
}