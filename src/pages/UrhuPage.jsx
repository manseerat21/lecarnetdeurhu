// src/pages/UrhuPage.jsx
import "../pagesStyles/UrhuPage.css";

function UrhuPage() {
  return (
    <section className="urhu-section">
      <header className="urhu-header">
        <h1>urhu</h1>
        <p className="intro">
          this page is not a bio. it’s a small plaque on the door: why this room
          exists, what it protects, and what it’s becoming.
        </p>
      </header>

      <div className="urhu-grid">
        <div className="card">
          <h2>what you’re looking at</h2>
          <p>
            <span className="em">le-carnet-de-urhu</span> is a slow archive:
            notes, postcards, letters, fragments, and small experiments.
            it’s meant to be visited—like a room—rather than performed—like a feed.
          </p>
          <p className="small">
            public pages stay gentle. private things live backstage.
          </p>
        </div>

        <div className="card">
          <h2>how to use it</h2>
          <ul>
            <li>if you don’t know where to go, go to <span className="em">today</span>.</li>
            <li>if you’re collecting images and letters, go to <span className="em">moon</span>.</li>
            <li>if you want a quiet working screen, go to <span className="em">café</span>.</li>
            <li>if you want context, stay here.</li>
          </ul>
        </div>

        <div className="card card--light">
          <h2>future versions</h2>
          <ul className="checks">
            <li>moon boards open into scrolling strips (per board)</li>
            <li>letters become “booklets”: folders, covers, pagination</li>
            <li>today notes can travel: into moon, into quotes, into hidden replies</li>
            <li>café gets ambient loops + a tiny sound toggle</li>
            <li>a “guestbook” mode: controlled visibility (public/private)</li>
            <li>backstage tools: edit/delete, tags, search</li>
          </ul>

          <div className="divider" />

          <p className="small">
            objective: build a kinder personal internet—version by version—without
            turning it into a product.
          </p>
        </div>
      </div>
    </section>
  );
}

export default UrhuPage;
