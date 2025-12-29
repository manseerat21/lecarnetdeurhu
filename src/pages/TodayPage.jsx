import { useState } from "react";
import "../pagesStyles/TodayPage.css";

function TodayPage() {
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([]);

  function dropNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setNotes([{ id: Date.now(), text: trimmed }, ...notes]);
    setNoteText("");
  }

  return (
    <section className="today-section">
      <header className="today-header">
        <h1>today</h1>
        <p className="intro">
          if you ended up here, you&apos;re in my little corner of the internet.{" "}
          leave a note, a line from a song, a secret goal, anything you want to
          fold into this day.
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
          <button className="note-button" onClick={dropNote}>
            drop note
          </button>
          <p className="note-hint">
            v0 • notes only live in your browser. later versions will let them
            travel and maybe answer back.
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
