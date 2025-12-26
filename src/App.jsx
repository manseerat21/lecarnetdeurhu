import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("today");

  return (
    <div className="app">
      <header className="app-header">
        <nav className="nav">
          <button
            className={page === "today" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("today")}
          >
            today
          </button>
          <button
            className={page === "cafe" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("cafe")}
          >
            café
          </button>
          <button
            className={page === "moon" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("moon")}
          >
            moon
          </button>
          <button
            className={page === "urhu" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("urhu")}
          >
            urhu
          </button>
        </nav>
      </header>

      <main className="app-main">
        {page === "today" && <TodayPage />}
        {page === "cafe" && <CafePage />}
        {page === "moon" && <MoonPage />}
        {page === "urhu" && <UrhuPage />}
      </main>

      <footer className="app-footer">
        <span>© 2025 urhu · v0</span>
      </footer>
    </div>
  );
}

/* ---------- PAGES ---------- */

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
    <section>
      <h1>today</h1>
      <p className="intro">
        if you ended up here, you&apos;re in my little corner of the internet.{" "}
        you can leave a note before you go.
      </p>

      <div className="notes-area">
        <div className="note-input-block">
          <textarea
            className="note-input"
            placeholder="leave a note for urhu (for now it only lives on your screen)…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button className="note-button" onClick={dropNote}>
            drop note
          </button>
          <p className="note-hint">
            v0: notes aren&apos;t saved anywhere yet, just here. future versions
            will let them travel.
          </p>
        </div>

        {notes.length > 0 && (
          <ul className="note-list">
            {notes.map((n) => (
              <li key={n.id} className="note-item">
                {n.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CafePage() {
  // random cozy background vibe for now (later: random video from your cafe-clips)
  const gradients = [
    "linear-gradient(135deg, #1b1020 0%, #26293c 45%, #433326 100%)",
    "linear-gradient(135deg, #111827 0%, #312e81 40%, #4b2c2c 100%)",
    "linear-gradient(135deg, #120c1b 0%, #1e293b 40%, #3f2a20 100%)",
  ];
  const [bgIndex] = useState(() =>
    Math.floor(Math.random() * gradients.length)
  );

  // sticky note content saved locally
  const [sticky, setSticky] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = localStorage.getItem("cafe-sticky");
    return saved ?? "";
  });

  useEffect(() => {
    localStorage.setItem("cafe-sticky", sticky);
  }, [sticky]);

  // very simple 25-minute pomodoro
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  function resetTimer() {
    setSecondsLeft(25 * 60);
    setRunning(false);
  }

  return (
    <section className="cafe-section">
      <h1>café</h1>
      <p className="section-intro">
        my study café. in future versions this page will play random clips from
        my café video folder, like a quiet background.
      </p>

      <div
        className="cafe-layout"
        style={{ backgroundImage: gradients[bgIndex] }}
      >
        <div className="cafe-ambient">
          <p>ambient screen placeholder</p>
          <p className="cafe-small">
            v0: gradients only. v1: videos from cafe-clips.
          </p>
        </div>

        <div className="cafe-widgets">
          <div className="sticky-note">
            <h2>desk note</h2>
            <textarea
              value={sticky}
              onChange={(e) => setSticky(e.target.value)}
              placeholder="things to remember while studying…"
            />
          </div>

          <div className="pomodoro">
            <h2>pomodoro</h2>
            <div className="pomodoro-time">
              {minutes}:{seconds}
            </div>
            <div className="pomodoro-controls">
              <button onClick={() => setRunning(true)}>start</button>
              <button onClick={() => setRunning(false)}>pause</button>
              <button onClick={resetTimer}>reset</button>
            </div>
            <p className="cafe-small">
              v0: basic 25-minute timer. later we can add cycles & sounds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoonPage() {
  return (
    <section>
      <h1>moon</h1>
      <p className="section-intro">
        letters and postcards that orbit my life. v0 is just the structure;
        later, this is where the galleries and poetry live.
      </p>

      <div className="moon-grid">
        <div className="moon-column">
          <h2>letters</h2>
          <p>
            poems, fragments, and small stories to future / past versions of me
            (and maybe you). v1 will turn this into a proper collection.
          </p>
        </div>
        <div className="moon-column">
          <h2>postcards</h2>
          <p>
            this will become boards, like pinterest folders: each one a mood,
            city, or story told only in images. uploading & layouts are planned
            for v1.
          </p>
        </div>
      </div>
    </section>
  );
}

function UrhuPage() {
  return (
    <section>
      <h1>urhu</h1>
      <p className="intro">
        this is the part where people normally write a neat bio. think of this
        more like a note pinned to the door.
      </p>

      <div className="card">
        <h2>who&apos;s here</h2>
        <ul>
          <li>student in winnipeg, orbiting code, languages, and poetry</li>
          <li>likes building small, cozy systems more than big loud ones</li>
          <li>trying to replace social media with slower, kinder spaces</li>
        </ul>
      </div>

      <div className="card">
        <h2>what this site wants</h2>
        <ul>
          <li>to be a room I actually visit</li>
          <li>to collect language, images, and quiet experiments</li>
          <li>to grow in versions instead of pretending to be finished</li>
        </ul>
      </div>
    </section>
  );
}

export default App;
