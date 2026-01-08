// src/pages/TodayPage.jsx
import { useEffect, useMemo, useState } from "react";
import "../pagesStyles/TodayPage.css";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function TodayPage() {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = useMemo(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [now]);

  const dateLabel = useMemo(() => {
    return now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [now]);

  async function dropNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "messages"), {
        text: trimmed,
        page: "today",
        createdAt: serverTimestamp(),
      });
      setNoteText("");
    } catch (err) {
      console.error("error saving note:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="today-section">
      <header className="today-header">
        <div className="today-timeblock">
          <div className="today-time">{timeLabel}</div>
          <div className="today-date">{dateLabel}</div>
        </div>

        <p className="today-intro">
          you ended up here, quietly. leave a note, a line from a song, a secret
          goal — anything you want to fold into this day.
        </p>
      </header>

      <div className="today-layout">
        <div className="today-main">
          <label className="note-label">drop something for future-urhu</label>

          <textarea
            className="note-input"
            placeholder="a thought, a worry, a miracle that hasn’t happened yet…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />

          <button className="note-button" onClick={dropNote} disabled={saving}>
            {saving ? "saving…" : "drop note"}
          </button>

          <p className="note-hint">
            v0.2.2 • notes are saved quietly. nothing shows publicly here.
          </p>
        </div>

        <aside className="today-aside">
          <div className="aside-card">
            <h2>a small rule</h2>
            <p>keep it short enough to reread later.</p>
            <p>keep it honest enough to matter.</p>
          </div>

          <div className="aside-card">
            <h2>what happens to notes?</h2>
            <p>they go to the backstage reel — only for me.</p>
            <p>later, they might travel into other pages.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default TodayPage;
