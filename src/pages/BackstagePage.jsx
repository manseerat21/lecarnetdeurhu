// src/pages/BackstagePage.jsx
import { useEffect, useState } from "react";
import "../pagesStyles/BackstagePage.css";

import { auth, db, storage } from "../firebase";
import {
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import backstageVideo from "../assets/backstage-cover.mp4";
import barcodePNG from "../assets/barcode.png";

const OWNER_EMAIL = import.meta.env.VITE_ADMIN_IDKEY;

function BackstagePage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  // owner view state
  const [messages, setMessages] = useState([]);

  const [quoteText, setQuoteText] = useState("");
  const [poemText, setPoemText] = useState("");
  const [poemFolder, setPoemFolder] = useState("");

  const [imageBoard, setImageBoard] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadBusy, setUploadBusy] = useState(false);

  const [now, setNow] = useState(() => new Date());

  // ✅ Vite base path safe for GitHub Pages (e.g. "/lecarnetdeurhu/")
  const BASE = import.meta.env.BASE_URL || "/";

  const goHome = () => {
    // Always go to the deployed app root, not the domain root
    window.location.href = BASE;
  };

  // --------- AUTH ---------

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return unsub;
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("GitHub sign-in failed", err);
      alert("couldn’t open the backstage door (check console).");
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error("sign-out error", err));
  };

  const isOwner = user && user.email === OWNER_EMAIL;

  // small boot-up pop animation for dialogs
  useEffect(() => {
    setDialogVisible(false);
    const id = setTimeout(() => setDialogVisible(true), 400);
    return () => clearTimeout(id);
  }, [checking, user, isOwner]);

  const baseDialogClass = `win-dialog ${
    dialogVisible ? "win-dialog--visible" : ""
  }`;

  // --------- OWNER CLOCK ---------

  useEffect(() => {
    if (!isOwner) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isOwner]);

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  // --------- OWNER SUBSCRIPTIONS ---------

  useEffect(() => {
    if (!isOwner) return;

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(data);
      },
      (err) => {
        console.error("error loading messages", err);
      }
    );

    return unsub;
  }, [isOwner]);

  // --------- OWNER ACTIONS ---------

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const trimmed = quoteText.trim();
    if (!trimmed) return;

    try {
      await addDoc(collection(db, "quotes"), {
        text: trimmed,
        active: true,
        createdAt: serverTimestamp(),
      });
      setQuoteText("");
    } catch (err) {
      console.error("error saving quote", err);
      alert("couldn’t save quote (see console).");
    }
  };

  const handlePoemSubmit = async (e) => {
    e.preventDefault();
    const trimmed = poemText.trim();
    if (!trimmed) return;

    try {
      await addDoc(collection(db, "poems"), {
        folder: poemFolder || "default",
        text: trimmed,
        createdAt: serverTimestamp(),
      });
      setPoemText("");
      setPoemFolder("");
    } catch (err) {
      console.error("error saving poem/letter", err);
      alert("couldn’t save poem (see console).");
    }
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageBoard || imageFiles.length === 0) return;

    try {
      setUploadBusy(true);

      for (const file of imageFiles) {
        const path = `postcards/${imageBoard}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "postcardImages"), {
          board: imageBoard,
          url,
          storagePath: path,
          createdAt: serverTimestamp(),
        });
      }

      setImageBoard("");
      setImageFiles([]);
      if (e.target && e.target.reset) e.target.reset();
    } catch (err) {
      console.error("error uploading images", err);
      alert("image upload failed (see console).");
    } finally {
      setUploadBusy(false);
    }
  };

  // --------- TRACKLIST NAV ---------

  const goToPage = (key) => {
    const valid = ["today", "cafe", "moon", "urhu"];
    if (!valid.includes(key)) return;

    // Always navigate via BASE (works even from /_edit)
    const params = new URLSearchParams();
    params.set("page", key);
    window.location.href = `${BASE}?${params.toString()}`;
  };

  // --------- GATE SCREENS ---------

  if (checking) {
    return (
      <div className="backstage-root backstage-root--gate">
        <div className="backstage-overlay" />
        <div className={`${baseDialogClass}`}>
          <div className="win-titlebar">
            <span className="win-title">checking identity…</span>
          </div>
          <div className="win-body win-body--center">
            <div className="win-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="backstage-root backstage-root--gate">
        <div className="backstage-overlay" />

        <div className={baseDialogClass}>
          <div className="win-titlebar">
            <span className="win-title">fill in the blank!</span>
          </div>

          <div className="win-body">
            <div className="win-row">
              <div className="win-icon">?</div>
              <div className="win-text-block">
                <p className="win-question">my name in this corner is</p>
                <p className="win-blank">urhu|&nbsp;▁▁▁▁▁</p>
                <p className="win-sub">
                  only the keeper of this little internet room can continue.
                </p>
              </div>
            </div>

            <div className="win-buttons">
              <button className="win-btn win-btn--primary" onClick={handleSignIn}>
                yes, that&apos;s me
              </button>
              <button className="win-btn" onClick={goHome}>
                not today
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="backstage-root backstage-root--gate">
        <div className="backstage-overlay" />

        <div className={baseDialogClass}>
          <div className="win-titlebar">
            <span className="win-title">access notice</span>
          </div>

          <div className="win-body">
            <p className="win-message">
              hi {user.displayName || user.email}. this backstage room only unlocks
              for <span className="win-highlight">urhu</span>.
            </p>

            <div className="win-buttons">
              <button className="win-btn win-btn--primary" onClick={handleSignOut}>
                switch github account
              </button>
              <button className="win-btn" onClick={goHome}>
                go back home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------- OWNER VIEW ---------

  return (
    <div className="backstage-root backstage-root--owner">
      <video className="backstage-video" autoPlay muted loop playsInline src={backstageVideo} />

      <div className="backstage-owner-shell">
        {/* COLUMN 1: meta / time / track list */}
        <section className="owner-col owner-col--meta">
          <div className="owner-clock-block">
            <div className="owner-time">
              <span className="owner-time-hm">
                {hh}:{mm}
              </span>
              <span className="owner-time-label"></span>
            </div>
            <p className="owner-date">{dateLabel}</p>
          </div>

          <div className="owner-barcode-block">
            <img src={barcodePNG} alt="barcode" className="owner-barcode" />
          </div>

          <div className="owner-tracklist">
            <p className="owner-tracklist-label">track list</p>
            <ol>
              <li onClick={() => goToPage("today")}>today</li>
              <li onClick={() => goToPage("cafe")}>café</li>
              <li onClick={() => goToPage("moon")}>moon</li>
              <li onClick={() => goToPage("urhu")}>urhu</li>
            </ol>
          </div>

          <button
            className="owner-btn owner-btn--primary owner-signout-btn"
            onClick={handleSignOut}
          >
            sign out
          </button>
        </section>

        {/* COLUMN 2: postcard + letters */}
        <section className="owner-col owner-col--uploads">
          <div className="owner-col2-top">
            {/* images */}
            <form className="owner-panel owner-panel--images" onSubmit={handleImageSubmit}>
              <h2 className="owner-panel-title">postcard images</h2>
              <p className="owner-panel-caption">
                choose a board and drop files. they&apos;ll float to the moon.
              </p>

              <div className="owner-field-row">
                <input
                  type="text"
                  className="owner-input"
                  placeholder="board / folder name…"
                  value={imageBoard}
                  onChange={(e) => setImageBoard(e.target.value)}
                />
              </div>

              <div className="owner-file-row">
                <label className="file-input-faux">
                  <span>choose images…</span>
                  <input type="file" multiple onChange={handleImageFilesChange} />
                </label>
                <span className="file-input-hint">
                  {imageFiles.length === 0
                    ? "no files selected"
                    : `${imageFiles.length} file${imageFiles.length > 1 ? "s" : ""} ready`}
                </span>
              </div>

              <div className="owner-panel-footer">
                <button type="submit" className="owner-btn owner-btn--primary" disabled={uploadBusy}>
                  {uploadBusy ? "uploading…" : "upload"}
                </button>
                <button
                  type="button"
                  className="owner-btn owner-btn--ghost"
                  onClick={() => alert("edit view coming in a later version.")}
                >
                  edit boards
                </button>
              </div>
            </form>

            {/* poems / letters */}
            <form className="owner-panel owner-panel--poems" onSubmit={handlePoemSubmit}>
              <h2 className="owner-panel-title">letters / poems</h2>
              <p className="owner-panel-caption">
                drafts for the letters page. folder acts like an album.
              </p>

              <div className="owner-field-row">
                <input
                  type="text"
                  className="owner-input owner-input--small"
                  placeholder="folder (optional)…"
                  value={poemFolder}
                  onChange={(e) => setPoemFolder(e.target.value)}
                />
              </div>

              <div className="owner-field-row">
                <textarea
                  className="owner-textarea"
                  placeholder="poem, letter, fragment…"
                  value={poemText}
                  onChange={(e) => setPoemText(e.target.value)}
                />
              </div>

              <div className="owner-panel-footer">
                <button type="submit" className="owner-btn owner-btn--primary">
                  save draft
                </button>
                <button
                  type="button"
                  className="owner-btn owner-btn--ghost"
                  onClick={() => alert("edit / delete drafts comes in a later version.")}
                >
                  edit drafts
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* COLUMN 3: quotes + messages */}
        <section className="owner-col owner-col--right">
          {/* quotes */}
          <form className="owner-panel owner-panel--quotes" onSubmit={handleQuoteSubmit}>
            <h2 className="owner-panel-title">ticker quotes</h2>
            <p className="owner-panel-caption">lines that cycle in the corner of the front page.</p>

            <div className="owner-field-row">
              <textarea
                className="owner-textarea owner-textarea--compact"
                placeholder="type a line and send it into orbit…"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
              />
            </div>

            <div className="owner-panel-footer">
              <button type="submit" className="owner-btn owner-btn--primary">
                queue quote
              </button>
              <button
                type="button"
                className="owner-btn owner-btn--ghost"
                onClick={() => alert("quote management table is a future version.")}
              >
                edit quotes
              </button>
            </div>
          </form>

          {/* messages reel */}
          <header className="owner-section-header owner-section-header--right">
            <span className="owner-section-label">messages to check</span>
            <span className="owner-section-sub">private log from the note card</span>
          </header>

          <div className="messages-reel">
            {messages.length === 0 ? (
              <p className="messages-empty">no messages archived yet. the reel waits for first frame.</p>
            ) : (
              <ul className="messages-list">
                {messages.map((m) => (
                  <li key={m.id} className="message-frame">
                    <p className="message-text">{m.text}</p>
                    {m.createdAt && (
                      <p className="message-meta">
                        {m.createdAt.toDate
                          ? m.createdAt.toDate().toLocaleString("en-CA", {
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BackstagePage;
