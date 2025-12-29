import { useEffect, useState } from "react";
import "../pagesStyles/CafePage.css";

function CafePage() {
  const gradients = [
    "linear-gradient(135deg, #20030a 0%, #4b111c 40%, #7a3b29 100%)",
    "linear-gradient(135deg, #1a050c 0%, #53121f 40%, #8b3e2a 100%)",
    "linear-gradient(135deg, #1b060e 0%, #5c1c2c 30%, #8a3b2b 100%)",
  ];

  const [bgIndex] = useState(() =>
    Math.floor(Math.random() * gradients.length)
  );

  const [sticky, setSticky] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = localStorage.getItem("cafe-sticky");
    return saved ?? "";
  });

  useEffect(() => {
    localStorage.setItem("cafe-sticky", sticky);
  }, [sticky]);

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
      <header>
        <h1>café</h1>
        <p className="section-intro">
          my little study café. later versions will play loops from a folder of
          café clips; for now it&apos;s gradients, a desk note, and a very small
          timer.
        </p>
      </header>

      <div
        className="cafe-layout"
        style={{ backgroundImage: gradients[bgIndex] }}
      >
        <div className="cafe-ambient">
          <p className="ambient-title">ambient screen</p>
          <p className="ambient-body">
            v0 • no video yet, just colours. imagine quiet clinking cups and a
            rainy window two tables away.
          </p>
        </div>

        <div className="cafe-widgets">
          <div className="sticky-note">
            <h2>desk note</h2>
            <textarea
              value={sticky}
              onChange={(e) => setSticky(e.target.value)}
              placeholder="what are you working on in this session?"
            />
            <p className="sticky-hint">
              saved in this browser only. clear it when you finish a chapter.
            </p>
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
              one focused 25-minute block. v1 might add long-break cycles and
              tiny sounds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CafePage;
