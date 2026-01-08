// src/pages/MoonPage.jsx
import { useEffect, useState } from "react";
import "../pagesStyles/MoonPage.css";

import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

import moonWallpaper from "../assets/moon-wallpaper.gif";

function MoonPage() {
  const [boards, setBoards] = useState([]);
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const qImages = query(
      collection(db, "postcardImages"),
      orderBy("createdAt", "desc"),
      limit(60)
    );

    const unsubImages = onSnapshot(
      qImages,
      (snap) => {
        const map = new Map();
        snap.forEach((doc) => {
          const data = doc.data();
          if (!data.board || !data.url) return;
          if (!map.has(data.board)) map.set(data.board, []);
          const arr = map.get(data.board);
          if (arr.length < 6) arr.push({ id: doc.id, url: data.url });
        });

        const grouped = Array.from(map.entries())
          .slice(0, 6)
          .map(([name, thumbs]) => ({ name, thumbs }));

        setBoards(grouped);
      },
      (err) => console.error("error loading postcard boards", err)
    );

    const qLetters = query(
      collection(db, "poems"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubLetters = onSnapshot(
      qLetters,
      (snap) => {
        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLetters(items);
      },
      (err) => console.error("error loading letters", err)
    );

    return () => {
      unsubImages();
      unsubLetters();
    };
  }, []);

  const formatLetterDate = (ts) => {
    if (!ts) return "";
    if (ts.toDate) {
      return ts.toDate().toLocaleDateString("en-CA", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    return "";
  };

  return (
    <section className="moon-section">
      <div
        className="moon-wallpaper"
        style={{ backgroundImage: `url(${moonWallpaper})` }}
      />

      {/* full-height overlay so the “blur line” does NOT stop early */}
      <div className="moon-overlay" />

      <div className="moon-inner">
        <header className="moon-header">
          <h1 className="moon-title">moon</h1>
          <p className="moon-subtitle">
            postcards & letters. a slow gallery. things that glow only at night.
          </p>
        </header>

        <div className="moon-layout">
          <section className="moon-panel moon-panel--boards">
            <div className="moon-panel-head">
              <h2>postcards</h2>
              <p>boards drift like folders. each one becomes a strip.</p>
            </div>

            {boards.length === 0 ? (
              <div className="moon-empty">
                <p>no postcards yet.</p>
                <span>backstage → postcard images</span>
              </div>
            ) : (
              <div className="moon-board-grid">
                {boards.map((b) => (
                  <div key={b.name} className="moon-board-card">
                    <div className="moon-board-meta">
                      <span className="moon-board-name">{b.name}</span>
                      <span className="moon-board-count">
                        {b.thumbs.length} frame{b.thumbs.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="moon-thumb-row">
                      {b.thumbs.slice(0, 6).map((t) => (
                        <div key={t.id} className="moon-thumb">
                          <img src={t.url} alt="" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="moon-foot">
              controlled from <span>backstage</span>. the public page stays quiet.
            </p>
          </section>

          <section className="moon-panel moon-panel--letters">
            <div className="moon-panel-head">
              <h2>letters</h2>
              <p>fragments that land here. folders later. booklets later.</p>
            </div>

            {letters.length === 0 ? (
              <div className="moon-empty">
                <p>no letters have landed yet.</p>
                <span>backstage → letters / poems</span>
              </div>
            ) : (
              <ul className="moon-letter-list">
                {letters.map((l) => (
                  <li key={l.id} className="moon-letter">
                    <div className="moon-letter-top">
                      <span className="moon-letter-folder">
                        {l.folder || "loose fragment"}
                      </span>
                      <span className="moon-letter-date">
                        {formatLetterDate(l.createdAt)}
                      </span>
                    </div>

                    <p className="moon-letter-text">
                      {l.text && l.text.length > 260 ? `${l.text.slice(0, 260)}…` : l.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="moon-footer">
          <span>the moon keeps what the day can’t.</span>
        </footer>
      </div>
    </section>
  );
}

export default MoonPage;
