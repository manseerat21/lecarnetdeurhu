import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../pagesStyles/CafePage.css";

import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/* ---------- localStorage keys ---------- */
const LS_STICKIES = "cafe-stickies-v1";
const LS_POMO = "cafe-pomo-v1";
const LS_POMO_POS = "cafe-pomo-pos-v1";
const LS_VIDEO_POOL = "cafe-video-pool-v1";
const LS_VIDEO_CURRENT = "cafe-video-current-v1";

const DEFAULT_POMO_SECONDS = 25 * 60;

/* ---------- utils ---------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function safeGetLS(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function safeSetLS(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

/* ---------- draggable hook ---------- */
function useDraggable(lsKey, defaultPos, nodeRef) {
  const [pos, setPos] = useState(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) return defaultPos;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === "number" && typeof parsed?.y === "number") return parsed;
    } catch {
      // ignore
    }
    return defaultPos;
  });

  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(pos));
    } catch {
      // ignore
    }
  }, [lsKey, pos]);

  const onPointerDown = useCallback(
    (ev) => {
      const el = nodeRef.current;
      if (!el) return;

      startRef.current = { x: ev.clientX, y: ev.clientY, px: pos.x, py: pos.y };

      const onMove = (e) => {
        setPos({
          x: startRef.current.px + (e.clientX - startRef.current.x),
          y: startRef.current.py + (e.clientY - startRef.current.y),
        });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [nodeRef, pos.x, pos.y]
  );

  return { pos, onPointerDown };
}

/* ---------- sticky notes ---------- */
function useStickyNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_STICKIES);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_STICKIES, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const addNote = () => {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    setNotes((n) => [
      ...n,
      { id, text: "", x: 40 + n.length * 18, y: 90 + n.length * 18 },
    ]);
  };

  const deleteNote = (id) => setNotes((n) => n.filter((x) => x.id !== id));

  const updateText = (id, text) =>
    setNotes((n) => n.map((x) => (x.id === id ? { ...x, text } : x)));

  const startDrag = (id) => (ev) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const start = { x: ev.clientX, y: ev.clientY, px: note.x, py: note.y };

    const onMove = (e) => {
      setNotes((ns) =>
        ns.map((n) =>
          n.id === id
            ? { ...n, x: start.px + (e.clientX - start.x), y: start.py + (e.clientY - start.y) }
            : n
        )
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return { notes, addNote, deleteNote, updateText, startDrag };
}

/* ---------- pomodoro ---------- */
function usePomodoro() {
  const init = () => {
    try {
      const raw = localStorage.getItem(LS_POMO);
      if (!raw) return { remaining: DEFAULT_POMO_SECONDS, running: false };

      const s = JSON.parse(raw);
      let remaining = Number(s?.remainingSeconds ?? DEFAULT_POMO_SECONDS);

      if (s?.running && Number.isFinite(s?.lastTickMs)) {
        const elapsed = Math.floor((Date.now() - s.lastTickMs) / 1000);
        remaining = Math.max(0, remaining - elapsed);
      }

      return { remaining, running: Boolean(s?.running && remaining > 0) };
    } catch {
      return { remaining: DEFAULT_POMO_SECONDS, running: false };
    }
  };

  const [{ remaining, running }, setState] = useState(init);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setState((s) => ({
        remaining: Math.max(0, s.remaining - 1),
        running: s.remaining > 1,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_POMO,
        JSON.stringify({
          remainingSeconds: remaining,
          running,
          lastTickMs: Date.now(),
        })
      );
    } catch {
      // ignore
    }
  }, [remaining, running]);

  return {
    minutes: String(Math.floor(remaining / 60)).padStart(2, "0"),
    seconds: String(remaining % 60).padStart(2, "0"),
    start: () => setState((s) => ({ ...s, running: true })),
    pause: () => setState((s) => ({ ...s, running: false })),
    reset: () => setState({ remaining: DEFAULT_POMO_SECONDS, running: false }),
  };
}

/* ---------- page ---------- */
function CafePage({ reseedNonce = 0 }) {
  const [videoEntries, setVideoEntries] = useState([]); // [{id, url}]
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState(() => safeGetLS(LS_VIDEO_CURRENT, ""));

  // ✅ load from Firebase Storage folder: "cafe-wall/"
  useEffect(() => {
    let alive = true;

    async function loadVideos() {
      setLoading(true);
      try {
        const folderRef = ref(storage, "cafe-wall"); // IMPORTANT: your storage folder name
        const res = await listAll(folderRef);

        const items = await Promise.all(
          res.items.map(async (itemRef) => {
            const dl = await getDownloadURL(itemRef);
            return { id: itemRef.fullPath, url: dl };
          })
        );

        if (!alive) return;
        setVideoEntries(items);

        // if no current URL saved (or it’s stale), pick one after load
        if (!safeGetLS(LS_VIDEO_CURRENT, "") && items.length) {
          const first = items[0].url;
          safeSetLS(LS_VIDEO_CURRENT, first);
          setUrl(first);
        }
      } catch (err) {
        console.error("Failed to load cafe-wall videos:", err);
        if (alive) setVideoEntries([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadVideos();
    return () => {
      alive = false;
    };
  }, []);

  const allIds = useMemo(() => videoEntries.map((v) => v.id), [videoEntries]);

  const pickNextVideo = useCallback(() => {
    if (!videoEntries.length) return;

    let pool = [];
    try {
      const raw = localStorage.getItem(LS_VIDEO_POOL);
      pool = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(pool)) pool = [];
    } catch {
      pool = [];
    }

    pool = pool.filter((id) => allIds.includes(id));
    if (!pool.length) pool = shuffle(allIds);

    const nextId = pool.shift();
    const next = videoEntries.find((v) => v.id === nextId) || videoEntries[0];

    safeSetLS(LS_VIDEO_POOL, JSON.stringify(pool));
    safeSetLS(LS_VIDEO_CURRENT, next.url);
    setUrl(next.url);
  }, [videoEntries, allIds]);

  // ✅ FIX: defer reseed so React doesn’t complain about sync setState inside effect
  useEffect(() => {
    if (reseedNonce <= 0) return;
    const raf = requestAnimationFrame(() => {
      pickNextVideo();
    });
    return () => cancelAnimationFrame(raf);
  }, [reseedNonce, pickNextVideo]);

  const videoRef = useRef(null);
  useEffect(() => {
    if (!url) return;
    videoRef.current?.play?.().catch(() => {});
  }, [url]);

  const pomo = usePomodoro();
  const stickies = useStickyNotes();

  const pomoRef = useRef(null);
  const pomoDrag = useDraggable(LS_POMO_POS, { x: 0, y: 0 }, pomoRef);

  return (
    <section className="cafe-section">
      <div className="cafe-video-wrap" aria-hidden="true">
        {url ? (
          <video
            ref={videoRef}
            className="cafe-video"
            src={url}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : null}
      </div>

      <div className="cafe-layer">
        <div className="cafe-dock">
          <div
            ref={pomoRef}
            className="pomo glass-dark"
            style={{
              transform: `translate(${pomoDrag.pos.x}px, ${pomoDrag.pos.y}px)`,
            }}
          >
            <div className="pomo-dragbar" onPointerDown={pomoDrag.onPointerDown}>
              <div className="pomo-grip" />
            </div>

            <div className="pomo-time">
              {pomo.minutes}:{pomo.seconds}
            </div>

            <div className="pomo-controls">
              <button className="btn-start" onClick={pomo.start}>
                start
              </button>
              <button className="btn-pause" onClick={pomo.pause}>
                pause
              </button>
              <button className="btn-reset" onClick={pomo.reset}>
                reset
              </button>
            </div>
          </div>

          <button
            className="dock-add glass-dark"
            onClick={stickies.addNote}
            aria-label="add note"
            type="button"
          >
            +
          </button>
        </div>

        {stickies.notes.map((n) => (
          <div
            key={n.id}
            className="sticky glass-dark"
            style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
          >
            <div className="sticky-head" onPointerDown={stickies.startDrag(n.id)}>
              <div className="sticky-grip" />
              <button
                className="icon-btn icon-btn--light"
                onClick={() => stickies.deleteNote(n.id)}
                aria-label="delete note"
                type="button"
              >
                ×
              </button>
            </div>

            <textarea
              value={n.text}
              onChange={(e) => stickies.updateText(n.id, e.target.value)}
              placeholder={loading ? "loading videos…" : "write something small…"}
            />
          </div>
        ))}

        {!loading && videoEntries.length === 0 ? (
          <div style={{ position: "absolute", bottom: 20, left: 20, opacity: 0.9 }}>
            No videos found in Firebase Storage folder: <b>cafe-wall/</b>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CafePage;
