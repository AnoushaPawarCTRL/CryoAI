import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import satellite from "../assets/a23a-satellite.jpg";
import mask from "../assets/a23a-mask.png";
import "./LandingPage.css";

const steps = [
  {
    title: "Collect",
    body: "Copernicus satellite imagery is matched to US National Ice Center iceberg positions.",
  },
  {
    title: "Label",
    body: "Icebergs are outlined in QGIS to build a training dataset from scratch.",
  },
  {
    title: "Segment",
    body: "A trained model predicts a pixel mask separating the iceberg from sea and sea ice.",
  },
  {
    title: "Measure",
    body: "The GeoTIFF transform gives each pixel's real size, so the mask becomes an area in km².",
  },
];

const models = [
  { name: "U-Net", kind: "Semantic segmentation", note: "Encoder and decoder CNN built for pixel level masks." },
  { name: "SAM", kind: "Transformer, fine tuned", note: "Fine tuned for assisted labelling to grow the dataset faster." },
  { name: "Detectron2", kind: "Instance segmentation", note: "Separates individual icebergs within one scene." },
  { name: "ResNet50", kind: "CNN backbone", note: "Pretrained features to compensate for a small dataset." },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="mono-label">Satellite imagery · Deep learning · Geodata</p>
            <h1>
              Iceberg mapping that takes <em>seconds</em>, not hours.
            </h1>
            <p className="hero-lede">
              Tracking icebergs by hand means outlining every one on satellite images, every week.
              CryoAI segments them automatically and measures their true area from the image's
              geographic metadata.
            </p>
            <div className="hero-ctas">
              <Link to="/app" className="btn btn-primary">
                Explore the demo
              </Link>
              <Link to="/signup" className="btn btn-ghost">
                Create an account
              </Link>
            </div>
          </div>

          <figure className="scene">
            <div className="scene-image">
              <img src={satellite} alt="Iceberg A23A in the Southern Ocean, seen from orbit" />
              <img src={mask} alt="" className="scene-mask" />
              <div className="scene-scan" aria-hidden="true" />
            </div>
            <figcaption className="scene-readout">
              <div>
                <span className="mono-label">Iceberg</span>
                <strong>A23A</strong>
              </div>
              <div>
                <span className="mono-label">Area</span>
                <strong>4,192 km²</strong>
              </div>
              <div>
                <span className="mono-label">Centroid</span>
                <strong>61.84°S 51.72°W</strong>
              </div>
            </figcaption>
          </figure>
        </section>

        <section id="how" className="section">
          <div className="section-head">
            <p className="mono-label">How it works</p>
            <h2>From raw imagery to a measured iceberg</h2>
          </div>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="step-num">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="models" className="section">
          <div className="section-head">
            <p className="mono-label">Models</p>
            <h2>Four approaches, compared</h2>
          </div>
          <div className="models">
            {models.map((m) => (
              <article key={m.name} className="model">
                <h3>{m.name}</h3>
                <p className="model-kind">{m.kind}</p>
                <p>{m.note}</p>
              </article>
            ))}
          </div>
          <aside className="finding">
            <p className="mono-label">Key finding</p>
            <p>
              Limited training data held back every model more than architecture did. That made
              faster labelling the priority, which is why SAM was fine tuned as a labelling
              assistant.
            </p>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <span>
          Built by Anousha Kaur Pawar · Final year project, BSc Computer Science, Brunel University
          London
        </span>
        <span className="footer-stack">React · FastAPI · PostgreSQL · TensorFlow</span>
      </footer>
    </div>
  );
}
