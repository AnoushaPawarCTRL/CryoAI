import { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SegmentationOverlay from "../components/SegmentationOverlay";

export default function HomePage() {
  const [icebergs, setIcebergs] = useState([]);
  const [selectedIceberg, setSelectedIceberg] = useState(null);
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/icebergs", { timeout: 5000 })
      .then((res) => setIcebergs(res.data))
      .catch((err) => console.error("AXIOS ERROR:", err));
  }, []);

  // Poll for updated icebergs every 5 seconds if there's a notification
  useEffect(() => {
    if (!notification) return;

    const interval = setInterval(() => {
      axios
        .get("http://127.0.0.1:5000/refresh-icebergs", { timeout: 5000 })
        .then((res) => setIcebergs(res.data))
        .catch((err) => console.error("REFRESH ERROR:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [notification]);

  const uploadImage = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload-image",
        formData
      );
      setIcebergs((prev) => [...prev, res.data]);
      setFile(null);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
    }
  };

  // Listen for mask generation notifications via broadcast
  useEffect(() => {
    const handleNotification = (event) => {
      setNotification("✅ Mask has been generated and saved!");
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener("maskReady", handleNotification);
    return () => window.removeEventListener("maskReady", handleNotification);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            position: "absolute",
            zIndex: 15,
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#4CAF50",
            color: "white",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: 14,
            fontWeight: "bold"
          }}
        >
          {notification}
        </div>
      )}

      {/* Upload */}
      <div
        style={{
          position: "absolute",
          zIndex: 5,
          top: 80,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          padding: "10px 12px",
          borderRadius: 8
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ color: "white" }}
        />
        <button onClick={uploadImage} style={{ marginLeft: 8 }}>
          Upload
        </button>
      </div>

      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={icebergs}
        pointLat="latitude"
        pointLng="longitude"
        pointRadius={2}
        pointAltitude={0.1}
        pointColor={() => "red"}
        width={window.innerWidth}
        height={window.innerHeight}
        onPointClick={(d) => setSelectedIceberg(d)}
      />

      {selectedIceberg && (
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 20,
            width: 360,
            background: "white",
            padding: "16px 12px 12px",
            borderRadius: 8,
            zIndex: 10,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)"
          }}
        >
          {/* ❌ CLOSE (X) BUTTON — INSERTED HERE */}
          <button
            onClick={() => setSelectedIceberg(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "none",
              background: "transparent",
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer",
              color: "#555"
            }}
            aria-label="Close"
          >
            ×
          </button>

          <h3>{selectedIceberg.name}</h3>

          {selectedIceberg.image_path && selectedIceberg.mask_path ? (
            <SegmentationOverlay
              imageUrl={`http://localhost:5000/${selectedIceberg.image_path}`}
              maskUrl={`http://localhost:5000/${selectedIceberg.mask_path}`}
              hoverOnly={true}
            />
          ) : (
            <p>No image or mask available</p>
          )}

          <p>Status: {selectedIceberg.status}</p>

          <p>
            Area:{" "}
            {selectedIceberg.area != null
              ? `${selectedIceberg.area.toFixed(1)} sq NM`
              : "Calculating..."}
          </p>

          <button
            onClick={() => navigate(`/history/${selectedIceberg.id}`)}
            style={{ marginTop: 8, width: "100%" }}
          >
            View Full History
          </button>

          <button
            onClick={() => setSelectedIceberg(null)}
            style={{ marginTop: 6, width: "100%" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
