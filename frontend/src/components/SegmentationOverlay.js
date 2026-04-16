import { useEffect, useRef, useState } from "react";

export default function SegmentationOverlay({ imageUrl, maskUrl, hoverOnly = false }) {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [maskLoaded, setMaskLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl || !maskUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    const mask = new Image();

    image.crossOrigin = "anonymous";
    mask.crossOrigin = "anonymous";

    image.src = imageUrl;
    mask.src = maskUrl;

    let maskData = null;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw base image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      setImageLoaded(true);
    };

    mask.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = mask.width;
      tempCanvas.height = mask.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.drawImage(mask, 0, 0);
      maskData = tempCtx.getImageData(0, 0, mask.width, mask.height).data;
      setMaskLoaded(true);
    };

    image.onerror = () => console.error("Failed to load image:", imageUrl);
    mask.onerror = () => console.error("Failed to load mask:", maskUrl);

    // Hover handling
    const handleMouseMove = (e) => {
      if (!imageLoaded || !maskLoaded || !hoverOnly) return;

      // Redraw base image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      // Draw mask overlay
      ctx.fillStyle = "red";
      ctx.globalAlpha = 0.3;

      const w = canvas.width;
      const h = canvas.height;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (maskData[i] > 0) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      ctx.globalAlpha = 1.0;

      // Draw strong border
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          if (maskData[i] === 0) continue;
          const left  = maskData[(y * w + x - 1) * 4] === 0;
          const right = maskData[(y * w + x + 1) * 4] === 0;
          const up    = maskData[((y - 1) * w + x) * 4] === 0;
          const down  = maskData[((y + 1) * w + x) * 4] === 0;
          if (left || right || up || down) {
            ctx.strokeRect(x, y, 1, 1);
          }
        }
      }
    };

    const handleMouseOut = () => {
      if (!imageLoaded) return;
      // Redraw base image only
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseout", handleMouseOut);
    };
  }, [imageUrl, maskUrl, hoverOnly, imageLoaded, maskLoaded]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        border: "1px solid #ccc",
        marginTop: 10,
        cursor: hoverOnly ? "pointer" : "default"
      }}
    />
  );
}
