import { useMemo, useState } from "react";
import "./App.css";

import FileStack from "./components/FileStack.jsx";
import QuoteTicker from "./components/QuoteTicker.jsx";

import Today from "./pages/TodayPage.jsx";
import Moon from "./pages/MoonPage.jsx";
import Cafe from "./pages/CafePage.jsx";
import Urhu from "./pages/UrhuPage.jsx";
import BackstagePage from "./pages/BackstagePage.jsx";

/** Order here is from LEFT(back) → RIGHT(front). The LAST item is the top card. */
const RAW_PAGES = [
  { key: "urhu", Component: Urhu },
  { key: "moon", Component: Moon },
  { key: "cafe", Component: Cafe },
  { key: "today", Component: Today },
];

// rotate so chosen page becomes the LAST item (front card)
function buildPagesOrder(initialKey) {
  if (!initialKey) return RAW_PAGES;
  const hasKey = RAW_PAGES.some((p) => p.key === initialKey);
  if (!hasKey) return RAW_PAGES;
  const chosen = RAW_PAGES.find((p) => p.key === initialKey);
  const rest = RAW_PAGES.filter((p) => p.key !== initialKey);
  return [...rest, chosen];
}

/**
 * GitHub Pages SPA fallback:
 * - 404.html redirects to: /<repo>/?p=/_edit&q=page=cafe
 * - We restore the real URL and query once React loads.
 */
function getEffectiveLocation() {
  const base = import.meta.env.BASE_URL || "/"; // e.g. "/lecarnetdeurhu/"
  const baseNoSlash = base.endsWith("/") ? base.slice(0, -1) : base;

  const sp = new URLSearchParams(window.location.search);
  const redirectedPath = sp.get("p"); // like "/_edit"
  const redirectedQuery = sp.get("q"); // like "page=today"

  // If we came from 404 redirect, rewrite URL back to the intended path (nice URLs)
  if (redirectedPath != null) {
    const q = redirectedQuery ? `?${redirectedQuery}` : "";
    const niceUrl = `${baseNoSlash}${redirectedPath}${q}${window.location.hash || ""}`;

    // Replace only once (prevents loops)
    window.history.replaceState(null, "", niceUrl);
  }

  // After possible replacement, compute route relative to base
  const pathname = window.location.pathname || "/";
  let route = pathname;

  if (baseNoSlash !== "/" && route.startsWith(baseNoSlash)) {
    route = route.slice(baseNoSlash.length); // "/_edit" or "/"
    if (!route.startsWith("/")) route = "/" + route;
  }

  const params = new URLSearchParams(window.location.search);
  return { route, params };
}

function App() {
  const { route, params } = getEffectiveLocation();

  const isEditPage = route === "/_edit" || route === "/_edit/";

  // keep your original ?page= behavior
  const initialKey = params.get("page");

  const basePages = useMemo(() => buildPagesOrder(initialKey), [initialKey]);

  const fallbackKey = RAW_PAGES[RAW_PAGES.length - 1].key; // "today"
  const [activePage, setActivePage] = useState(
    initialKey && RAW_PAGES.some((p) => p.key === initialKey)
      ? initialKey
      : fallbackKey
  );

  // reseed nonce for café background – increments ONLY when the café label is clicked
  const [cafeReseedNonce, setCafeReseedNonce] = useState(0);

  const pages = useMemo(
    () =>
      basePages.map((p) =>
        p.key === "cafe"
          ? { ...p, Component: () => <Cafe reseedNonce={cafeReseedNonce} /> }
          : p
      ),
    [basePages, cafeReseedNonce]
  );

  if (isEditPage) {
    return (
      <div className="app">
        <BackstagePage />
      </div>
    );
  }

  return (
    <div className="app">
      <FileStack
        pages={pages}
        onActiveChange={setActivePage}
        onLabelClick={(key) => {
          if (key === "cafe" && activePage === "cafe") {
            setCafeReseedNonce((n) => n + 1);
          }
        }}
      />
      <QuoteTicker activePage={activePage} />
    </div>
  );
}

export default App;
