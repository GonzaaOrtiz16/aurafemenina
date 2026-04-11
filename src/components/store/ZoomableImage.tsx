import { useState, useRef, useCallback } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  onZoomChange?: (zoomed: boolean) => void;
}

type GestureAxis = "undetermined" | "x" | "y";

export default function ZoomableImage({ src, alt, onZoomChange }: ZoomableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const startTranslate = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const gestureAxis = useRef<GestureAxis>("undetermined");

  // Desktop mouse drag state
  const isMouseDragging = useRef(false);
  const mouseDragStart = useRef({ x: 0, y: 0 });

  const MAX_SCALE = 3;
  const MIN_SCALE = 1;
  const GESTURE_LOCK_THRESHOLD = 10;

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

  const updateZoomState = useCallback((newScale: number) => {
    const zoomed = newScale > 1.05;
    if (zoomed !== isZoomed) {
      setIsZoomed(zoomed);
      onZoomChange?.(zoomed);
    }
  }, [isZoomed, onZoomChange]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsZoomed(false);
    onZoomChange?.(false);
  }, [onZoomChange]);

  const resetGestureAxis = useCallback(() => {
    gestureAxis.current = "undetermined";
  }, []);

  const resolveGestureAxis = useCallback((clientX: number, clientY: number) => {
    if (gestureAxis.current !== "undetermined") return gestureAxis.current;

    const dx = clientX - touchStart.current.x;
    const dy = clientY - touchStart.current.y;

    if (Math.abs(dx) < GESTURE_LOCK_THRESHOLD && Math.abs(dy) < GESTURE_LOCK_THRESHOLD) {
      return "undetermined";
    }

    gestureAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    return gestureAxis.current;
  }, []);

  // ── Desktop: scroll wheel zoom ──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
    const newT = clampTranslate(translate.x, translate.y, newScale);
    setScale(newScale);
    setTranslate(newT);
    updateZoomState(newScale);
    if (newScale < 1.1 && delta < 1) {
      resetZoom();
    }
  }, [scale, translate, clampTranslate, updateZoomState, resetZoom]);

  // ── Desktop: mouse drag to pan ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    isMouseDragging.current = true;
    mouseDragStart.current = { x: e.clientX, y: e.clientY };
    startTranslate.current = { ...translate };
  }, [scale, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDragging.current || scale <= 1) return;
    const dx = e.clientX - mouseDragStart.current.x;
    const dy = e.clientY - mouseDragStart.current.y;
    const newT = clampTranslate(startTranslate.current.x + dx, startTranslate.current.y + dy, scale);
    setTranslate(newT);
  }, [scale, clampTranslate]);

  const handleMouseUp = useCallback(() => {
    isMouseDragging.current = false;
  }, []);

  // ── Touch: pinch & pan ──
  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const getCenter = (t1: React.Touch, t2: React.Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      isPanning.current = false;
      resetGestureAxis();
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastCenter.current = getCenter(e.touches[0], e.touches[1]);
      startTranslate.current = { ...translate };
      e.preventDefault();
    } else if (e.touches.length === 1 && scale > 1) {
      isPanning.current = true;
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startTranslate.current = { ...translate };
      // Don't preventDefault here — allow browser to handle scroll if not zoomed enough
    } else if (e.touches.length === 1) {
      isPinching.current = false;
      isPanning.current = false;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      resetGestureAxis();
    }
  }, [scale, translate, resetGestureAxis]);

  const handleTouchMoveCapture = useCallback((e: React.TouchEvent) => {
    if (scale > 1 || isPinching.current || e.touches.length !== 1) return;

    const axis = resolveGestureAxis(e.touches[0].clientX, e.touches[0].clientY);

    if (axis === "y") {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation?.();
    }
  }, [scale, resolveGestureAxis]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPinching.current && e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      const ratio = dist / lastDistance.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * ratio));

      const dx = center.x - lastCenter.current.x;
      const dy = center.y - lastCenter.current.y;
      const newT = clampTranslate(startTranslate.current.x + dx, startTranslate.current.y + dy, newScale);

      setScale(newScale);
      setTranslate(newT);
      updateZoomState(newScale);

      lastDistance.current = dist;
      lastCenter.current = center;
      startTranslate.current = newT;
    } else if (scale <= 1 && e.touches.length === 1) {
      const axis = resolveGestureAxis(e.touches[0].clientX, e.touches[0].clientY);
      if (axis === "y") return;
    } else if (isPanning.current && e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      const newT = clampTranslate(startTranslate.current.x + dx, startTranslate.current.y + dy, scale);
      setTranslate(newT);
    }
  }, [scale, clampTranslate, updateZoomState, resolveGestureAxis]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) isPinching.current = false;
    if (e.touches.length === 0) {
      isPanning.current = false;
      resetGestureAxis();
      if (scale < 1.1) resetZoom();
    }
  }, [scale, resetZoom, resetGestureAxis]);

  const handleTouchCancel = useCallback(() => {
    isPinching.current = false;
    isPanning.current = false;
    resetGestureAxis();
  }, [resetGestureAxis]);

  // ── Double click / double tap ──
  const lastTap = useRef(0);
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
      setTranslate({ x: 0, y: 0 });
      setIsZoomed(true);
      onZoomChange?.(true);
    }
  }, [scale, resetZoom, onZoomChange]);

  const handleTap = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 0) return;
    const now = Date.now();
    if (now - lastTap.current < 300) handleDoubleClick();
    lastTap.current = now;
  }, [handleDoubleClick]);

  const cursorStyle = scale > 1
    ? (isMouseDragging.current ? "grabbing" : "grab")
    : "zoom-in";

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{
        cursor: cursorStyle,
        touchAction: scale > 1 ? "none" : "pan-y",
      }}
      onTouchStart={handleTouchStart}
      onTouchMoveCapture={handleTouchMoveCapture}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => { handleTouchEnd(e); handleTap(e); }}
      onTouchCancel={handleTouchCancel}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-contain select-none pointer-events-none"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: scale === 1 && !isPinching.current ? "transform 0.2s ease-out" : "none",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}
