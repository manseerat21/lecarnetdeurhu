// src/components/QuoteTicker.jsx
import { useEffect, useState } from "react";
import "../componentsStyles/QuoteTicker.css";
import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const TYPE_SPEED = 60;
const DELETE_SPEED = 40;
const HOLD_FULL = 7000;
const HOLD_EMPTY = 500;

function QuoteTicker({ activePage = "today" }) {
  const [quotes, setQuotes] = useState([]);
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState("typing");

  const textColorVar = `var(--${activePage}-card-text-color)`;
  const glowColorVar = `var(--${activePage}-card-color)`;

  // load quotes once on mount
  useEffect(() => {
    async function loadQuotes() {
      try {
        // src/components/QuoteTicker.jsx (inside loadQuotes)
        const q = query(
          collection(db, "quotes"),
          where("active", "==", true)
          // no orderBy for now – avoids composite index requirement
        );

        const snap = await getDocs(q);
        const items = snap.docs
          .map((doc) => doc.data().text)
          .filter(Boolean);


        // fallback if collection empty
        if (items.length === 0) {
          setQuotes([
            "no quotes in the database yet. add some in firebase console.",
          ]);
        } else {
          setQuotes(items);
        }

        setIndex(0);
        setDisplayText("");
        setPhase("typing");
      } catch (err) {
        console.error("Error loading quotes:", err);
        setQuotes([
          "could not load quotes from the backend (check console).",
        ]);
      }
    }

    loadQuotes();
  }, []);

  // type / delete animation
  useEffect(() => {
    if (quotes.length === 0) return;

    const currentQuote = quotes[index % quotes.length];

    if (phase === "typing") {
      if (displayText.length < currentQuote.length) {
        const id = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length + 1));
        }, TYPE_SPEED);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => setPhase("deleting"), HOLD_FULL);
        return () => clearTimeout(id);
      }
    }

    if (phase === "deleting") {
      if (displayText.length > 0) {
        const id = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length - 1));
        }, DELETE_SPEED);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => {
          setIndex((prev) => (prev + 1) % quotes.length);
          setPhase("typing");
          setDisplayText("");
        }, HOLD_EMPTY);
        return () => clearTimeout(id);
      }
    }
  }, [phase, displayText, index, quotes]);

  if (quotes.length === 0) return null;

  return (
    <div
      className="quote-ticker"
      style={{
        color: textColorVar,
        textShadow: `0 2px 4px ${glowColorVar}`,
      }}
    >
      <span className="quote-text">{displayText}</span>
      <span className="quote-cursor">▌</span>
    </div>
  );
}

export default QuoteTicker;
