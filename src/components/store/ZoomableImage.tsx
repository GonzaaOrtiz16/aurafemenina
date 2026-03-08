import { useState, useRef, useCallback } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  onZoomChange?: (zoomed: boolean) => void;
}

export default function ZoomableImage({ src, alt, onZoomChange }: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Touch state refs (avoid re-renders during gestures)
  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const startTranslate = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const MAX_SCALE = 3;
  const MIN_SCALE = 1;

  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    if (!container) return { x: tx, y: ty };
    const rect = container.getBoundingClientRect();
    const maxX = (rect.width * (s - 1)) / 2;
    const maxY = (rect.height * (s - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsZoomed(false);
    onZoomChange?.(false);
  }, [onZoomChange]);

  const getDistance = (t1: Touch, t2: Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const getCenter = (t1: Touch, t2: Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      isPanning.current = false;
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastCenter.current = getCenter(e.touches[0], e.touches[1]);
      startTranslate.current = { ...translate };
      e.preventDefault();
    } else if (e.touches.length === 1 && scale > 1) {
      isPanning.current = true;
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startTranslate.current = { ...translate };
      e.preventDefault();
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPinching.current && e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      const ratio = dist / lastDistance.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * ratio));

      const dx = center.x - lastCenter.current.x;
      const dy = center.y - lastCenter.current.y;
      const newT = clampTranslate(
        startTranslate.current.x + dx,
        startTranslate.current.y + dy,
        newScale
      );

      setScale(newScale);
      setTranslate(newT);

      const zoomed = newScale > 1.05;
      if (zoomed !== isZoomed) {
        setIsZoomed(zoomed);
        onZoomChange?.(zoomed);
      }

      lastDistance.current = dist;
      lastCenter.current = center;
      startTranslate.current = newT;
    } else if (isPanning.current && e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      const newT = clampTranslate(
        startTranslate.current.x + dx,
        startTranslate.current.y + dy,
        scale
      );
      setTranslate(newT);
    }
  }, [scale, isZoomed, clampTranslate, onZoomChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinching.current = false;
    }
    if (e.touches.length === 0) {
      isPanning.current = false;
      if (scale < 1.1) {
        resetZoom();
      }
    }
  }, [scale, resetZoom]);

  // Double tap to zoom
  const lastTap = useRef(0);
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
      setIsZoomed(true);
      onZoomChange?.(true);
    }
  }, [scale, resetZoom, onZoomChange]);

  const handleTap = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 0) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleClick();
    }
    lastTap.current = now;
  }, [handleDoubleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => { handleTouchEnd(e); handleTap(e); }}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover select-none"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: scale === 1 && !isPinching.current ? "transform 0.2s ease-out" : "none",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
