// src/pages/TodayPage.jsx
import { useState } from "react";
import "../pagesStyles/TodayPage.css";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

function TodayPage() {
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);

  async function dropNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      // save to Firestore
      await addDoc(collection(db, "messages"), {
        text: trimmed,
        page: "today",
        createdAt: serverTimestamp(),
      });

      // update local list so user sees it immediately
      setNotes((prev) => [{ id: Date.now(), text: trimmed }, ...prev]);
      setNoteText("");
    } catch (err) {
      console.error("error saving note:", err);
      // later we can surface a tiny UI error msg if you want
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="today-section">
      <header className="today-header">
        <h1>today</h1>
        <p className="intro">
          if you ended up here, you&apos;re in my little corner of the
          internet. leave a note, a line from a song, a secret goal, anything
          you want to fold into this day.
        </p>
      </header>

      <div className="notes-area">
        <div className="note-input-block">
          <label className="note-label">drop something for future-urhu</label>
          <textarea
            className="note-input"
            placeholder="a thought, a worry, a miracle that hasn’t happened yet…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            className="note-button"
            onClick={dropNote}
            disabled={saving}
          >
            {saving ? "saving…" : "drop note"}
          </button>
          <p className="note-hint">
            v0.2.1 • notes are quietly saved in the backend now. later versions
            will let them travel and maybe answer back.
          </p>
        </div>

        <div className="note-list-wrapper">
          <h2 className="note-list-title">
            today&apos;s scraps <span>({notes.length})</span>
          </h2>
          {notes.length === 0 ? (
            <p className="note-empty">
              no notes yet. first one sets the tone for the day.
            </p>
          ) : (
            <ul className="note-list">
              {notes.map((n) => (
                <li key={n.id} className="note-item">
                  {n.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default TodayPage;
