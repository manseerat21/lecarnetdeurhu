// src/App.jsx
import { useState } from "react";
import "./App.css";

import FileStack from "./components/FileStack.jsx";
import QuoteTicker from "./components/QuoteTicker.jsx";

import Today from "./pages/TodayPage.jsx";
import Moon from "./pages/MoonPage.jsx";
import Cafe from "./pages/CafePage.jsx";
import Urhu from "./pages/UrhuPage.jsx";
import BackstagePage from "./pages/BackstagePage.jsx";

/**
 * Order here is from LEFT(back) → RIGHT(front).
 * The LAST item is the top card.
 */
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

  // rest at the back, chosen at the very front
  return [...rest, chosen];
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const initialKey = params.get("page");

  const pages = buildPagesOrder(initialKey);

  const fallbackKey = RAW_PAGES[RAW_PAGES.length - 1].key; // normally "today"
  const [activePage, setActivePage] = useState(
    initialKey && RAW_PAGES.some((p) => p.key === initialKey)
      ? initialKey
      : fallbackKey
  );

  const pathname = window.location.pathname || "";
  const isEditPage =
    pathname.endsWith("/_edit") || pathname.endsWith("/_edit/");

  if (isEditPage) {
    return (
      <div className="app">
        <BackstagePage />
      </div>
    );
  }

  return (
    <div className="app">
      <FileStack pages={pages} onActiveChange={setActivePage} />
      <QuoteTicker activePage={activePage} />
    </div>
  );
}

export default App;
