import "../pagesStyles/MoonPage.css";

function MoonPage() {
  return (
    <section className="moon-section">
      <h1>moon</h1>
      <p className="section-intro">
        letters and postcards that orbit my life. this version is just scaffolding;
        later it turns into real galleries, scans, and poems to people who will
        never read them.
      </p>

      <div className="moon-grid">
        <div className="moon-column">
          <h2>letters</h2>
          <p>
            slow, private pieces. future sections: letters to future-me, drafts
            i never sent, and fragments that became poems somewhere else.
          </p>
          <p className="moon-footnote">
            v1 • markdown letters with dates &quot;mailed&quot; by clicking a tiny stamp.
          </p>
        </div>

        <div className="moon-column">
          <h2>postcards</h2>
          <p>
            image boards, like pinterest but quieter: cities, train windows,
            stray dogs, bookshop corners. each board will feel like a night
            you can reopen.
          </p>
          <p className="moon-footnote">
            v1 • folders you can click into, each with an endless column of images.
          </p>
        </div>
      </div>
    </section>
  );
}

export default MoonPage;
