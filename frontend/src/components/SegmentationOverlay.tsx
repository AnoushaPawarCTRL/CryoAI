import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  maskUrl: string;
  showMask: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

// Turns a black and white mask into a tinted fill with a solid outline
function buildOverlay(mask: HTMLImageElement): HTMLCanvasElement {
  const { width: w, height: h } = mask;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(mask, 0, 0);

  const src = ctx.getImageData(0, 0, w, h).data;
  const out = ctx.createImageData(w, h);
  const isIce = (x: number, y: number) => src[(y * w + x) * 4] > 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isIce(x, y)) continue;
      const edge =
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
        !isIce(x - 1, y) || !isIce(x + 1, y) || !isIce(x, y - 1) || !isIce(x, y + 1);
      const i = (y * w + x) * 4;
      out.data[i] = 94;
      out.data[i + 1] = 234;
      out.data[i + 2] = 212;
      out.data[i + 3] = edge ? 255 : 80;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

export default function SegmentationOverlay({ imageUrl, maskUrl, showMask }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<{ image: HTMLImageElement; overlay: HTMLCanvasElement } | null>(null);
  const [failed, setFailed] = useState(false);

  // Load both images once per iceberg
  useEffect(() => {
    let cancelled = false;
    setLayers(null);
    setFailed(false);
    Promise.all([loadImage(imageUrl), loadImage(maskUrl)])
      .then(([image, mask]) => {
        if (!cancelled) setLayers({ image, overlay: buildOverlay(mask) });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [imageUrl, maskUrl]);

  // Redraw whenever the images arrive or the toggle changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layers) return;
    canvas.width = layers.image.width;
    canvas.height = layers.image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(layers.image, 0, 0);
    if (showMask) ctx.drawImage(layers.overlay, 0, 0, canvas.width, canvas.height);
  }, [layers, showMask]);

  if (failed) return <div className="overlay-placeholder">Couldn't load the image or mask.</div>;
  if (!layers) return <div className="overlay-placeholder">Loading imagery…</div>;
  return <canvas ref={canvasRef} className="overlay-canvas" />;
}
