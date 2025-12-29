import "../pagesStyles/UrhuPage.css";

function UrhuPage() {
  return (
    <section className="urhu-section">
      <h1>urhu</h1>
      <p className="intro">
        this is the part where people usually write a neat bio. think of this
        more like a note taped to the door of a room you can visit.
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
          <li>to be a room i actually visit, not just a portfolio</li>
          <li>to collect language, images, and quiet experiments</li>
          <li>to grow in versions instead of pretending to be finished</li>
        </ul>
      </div>

      <div className="card card--light">
        <h2>right now</h2>
        <ul>
          <li>learning how to make tiny, caring tools on the web</li>
          <li>studying languages &amp; keeping a poetry folder open</li>
          <li>slowly building this site into a place friends can hang out</li>
        </ul>
      </div>
    </section>
  );
}

export default UrhuPage;
