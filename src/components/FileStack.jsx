import React, { useState } from "react";
import "../componentsStyles/FileStack.css";

const DEFAULT_WIDTH = "100.5%";

// Where each tab sits vertically
const TAB_OFFSETS = {
  today: "44%",
  cafe: "59%",
  moon: "74%",
  urhu: "89%",
};

// What label to show on the tab
const LABELS = {
  today: "today",
  cafe: "café",
  moon: "moon",
  urhu: "urhu",
};

function FileStack({ pages, onActiveChange, onLabelClick }) {
  // initial order = order given by App
  const [order, setOrder] = useState(() => pages.map((p) => p.key));

  const getPage = (key) => pages.find((p) => p.key === key);

  const bringToFront = (key) => {
    setOrder((prev) => {
      const without = prev.filter((k) => k !== key);
      const nextOrder = [...without, key];
      onActiveChange?.(key);
      return nextOrder;
    });
  };

  return (
    <div className="file-stack">
      {order.map((key, position) => {
        const page = getPage(key);
        if (!page) return null;

        const isFront = position === order.length - 1;
        const PageComponent = page.Component;
        const label = LABELS[key] ?? key;
        const tabOffset = TAB_OFFSETS[key] ?? "50%";

        return (
          <div
            key={key}
            className={`file-card ${isFront ? "file-card--active" : ""}`}
            style={{
              "--position": position,
              "--cardWidth": DEFAULT_WIDTH,
              "--cardColor": `var(--${key}-card-color)`,
              "--cardTextColor": `var(--${key}-card-text-color)`,
              "--cardBackground": `var(--${key}-card-background, var(--${key}-card-color))`,
              "--tabOffset": tabOffset,
            }}
            onClick={() => bringToFront(key)}
          >
            <div className="file-main">
              <PageComponent />
            </div>

            <button
              type="button"
              className="file-label"
              onClick={(e) => {
                e.stopPropagation();           // don’t bubble to card click
                bringToFront(key);             // still bring to front
                onLabelClick?.(key);           // notify App (used to reseed café)
              }}
              aria-label={`${label} tab`}
            >
              <span>{label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default FileStack;
