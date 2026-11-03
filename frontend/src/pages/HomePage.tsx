import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Globe, { GlobeMethods } from "react-globe.gl";
import { Wordmark } from "../components/Navbar";
import SegmentationOverlay from "../components/SegmentationOverlay";
import { currentUserEmail, logout } from "../api/auth";
import { fetchIcebergs, fileUrl, Iceberg, loadDemo, SQ_NM_TO_KM2, uploadImage } from "../api/icebergs";
import "./HomePage.css";

const SIDEBAR_WIDTH = 380;
const TOPBAR_HEIGHT = 60;

function formatArea(sqnm: number | null | undefined) {
  if (sqnm == null) return null;
  const km2 = sqnm * SQ_NM_TO_KM2;
  return {
    km2: km2.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    sqnm: sqnm.toLocaleString(undefined, { maximumFractionDigits: 1 }),
  };
}

function formatCoord(lat: number, lng: number) {
  const ns = lat < 0 ? "S" : "N";
  const ew = lng < 0 ? "W" : "E";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lng).toFixed(2)}°${ew}`;
}

// Keeps the globe sized to the space left of the sidebar
function useGlobeSize() {
  const calc = () => ({
    width: Math.max(window.innerWidth - SIDEBAR_WIDTH, 320),
    height: window.innerHeight - TOPBAR_HEIGHT,
  });
  const [size, setSize] = useState(calc);
  useEffect(() => {
    const onResize = () => setSize(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export default function HomePage() {
  const navigate = useNavigate();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const size = useGlobeSize();
  const email = currentUserEmail();

  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [selected, setSelected] = useState<Iceberg | null>(null);
  const [showMask, setShowMask] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setIcebergs(await fetchIcebergs());
      setError("");
    } catch {
      setError("Can't reach the API at localhost:8000. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while any iceberg is still waiting for a mask
  useEffect(() => {
    if (!icebergs.some((i) => i.status === "pending")) return;
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [icebergs, refresh]);

  // Slow spin until the user picks an iceberg
  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    controls.autoRotate = !selected;
    controls.autoRotateSpeed = 0.35;
  }, [selected, size]);

  const select = (iceberg: Iceberg | null) => {
    setSelected(iceberg);
    setShowMask(true);
    if (iceberg) {
      globeRef.current?.pointOfView(
        { lat: iceberg.latitude, lng: iceberg.longitude, altitude: 1.4 },
        1200
      );
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const created = await uploadImage(file);
      setIcebergs((prev) => [...prev, created]);
    } catch {
      setError("Upload failed. Check the file is a GeoTIFF (.tif).");
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = async () => {
    setBusy(true);
    try {
      await loadDemo();
      await refresh();
    } catch {
      setError("Couldn't load the demo iceberg.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const rings = useMemo(() => (selected ? [selected] : []), [selected]);
  const selectedArea = formatArea(selected?.area);
  const imageUrl = fileUrl(selected?.image_path);
  const maskUrl = fileUrl(selected?.mask_path);

  return (
    <div className="dash">
      <header className="dash-top">
        <Wordmark />
        <div className="dash-user">
          {email ? (
            <>
              <span className="dash-email">{email}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <span className="chip">Guest mode</span>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="dash-body">
        <div className="dash-globe">
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="/textures/earth-blue-marble.jpg"
            bumpImageUrl="/textures/earth-topology.png"
            atmosphereColor="#7dd3fc"
            atmosphereAltitude={0.18}
            pointsData={icebergs}
            pointLat="latitude"
            pointLng="longitude"
            pointColor={(d) => ((d as Iceberg).status === "complete" ? "#5eead4" : "#fbbf24")}
            pointAltitude={0.02}
            pointRadius={0.9}
            pointLabel={(d) => (d as Iceberg).name}
            onPointClick={(d) => select(d as Iceberg)}
            ringsData={rings}
            ringLat="latitude"
            ringLng="longitude"
            ringColor={() => (t: number) => `rgba(94,234,212,${1 - t})`}
            ringMaxRadius={4}
            ringPropagationSpeed={2}
            ringRepeatPeriod={1200}
          />
        </div>

        <aside className="dash-side">
          {error && <p className="dash-error">{error}</p>}

          {selected ? (
            <section className="detail">
              <button className="back" onClick={() => select(null)}>
                ← All icebergs
              </button>
              <h2>{selected.name}</h2>
              <span className={`status status-${selected.status}`}>
                {selected.status === "complete" ? "Segmented" : "Awaiting mask"}
              </span>

              {imageUrl && maskUrl ? (
                <>
                  <SegmentationOverlay imageUrl={imageUrl} maskUrl={maskUrl} showMask={showMask} />
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={showMask}
                      onChange={(e) => setShowMask(e.target.checked)}
                    />
                    Show segmentation mask
                  </label>
                </>
              ) : (
                <div className="overlay-placeholder">No mask yet for this image.</div>
              )}

              <dl className="stats">
                <div>
                  <dt>Area</dt>
                  <dd>{selectedArea ? `${selectedArea.km2} km²` : "Not measured"}</dd>
                  {selectedArea && <dd className="sub">{selectedArea.sqnm} sq NM</dd>}
                </div>
                <div>
                  <dt>Centroid</dt>
                  <dd>{formatCoord(selected.latitude, selected.longitude)}</dd>
                </div>
              </dl>
            </section>
          ) : (
            <>
              <section className="panel">
                <h2>Upload imagery</h2>
                <p className="panel-text">
                  Add a GeoTIFF satellite image. Its mask and area appear here once segmentation
                  finishes.
                </p>
                <label className={`dropzone ${busy ? "is-busy" : ""}`}>
                  <input type="file" accept=".tif,.tiff" onChange={handleUpload} disabled={busy} />
                  {busy ? "Working…" : "Choose a .tif file"}
                </label>
              </section>

              <section className="panel panel-list">
                <div className="list-head">
                  <h2>Icebergs</h2>
                  <span className="mono-label">{icebergs.length} tracked</span>
                </div>

                {loading ? (
                  <p className="panel-text">Loading…</p>
                ) : icebergs.length === 0 ? (
                  <div className="empty">
                    <p className="panel-text">No icebergs yet. Load the demo to see A23A segmented.</p>
                    <button className="btn btn-primary btn-sm" onClick={handleDemo} disabled={busy}>
                      Load demo iceberg
                    </button>
                  </div>
                ) : (
                  <ul className="list">
                    {icebergs.map((i) => {
                      const area = formatArea(i.area);
                      return (
                        <li key={i.id}>
                          <button onClick={() => select(i)}>
                            <span className={`dot dot-${i.status}`} />
                            <span className="list-name">{i.name}</span>
                            <span className="list-area">{area ? `${area.km2} km²` : "pending"}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
