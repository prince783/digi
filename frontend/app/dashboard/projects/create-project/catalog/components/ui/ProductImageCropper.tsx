"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
export default function ProductImageCropper({
  src,
  onCancel,
  onSave,
  aspectRatio = 1,
  title = "Crop Product Image",
  outputWidth = 800,
  outputHeight = 800,
}: {
  src: string;
  onCancel: () => void;
  onSave: (image: string) => void;
  aspectRatio?: number;
  title?: string;
  outputWidth?: number;
  outputHeight?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });
  const viewportWidth = 320;
  const viewportHeight = viewportWidth / aspectRatio;

  const getImageLayout = () => {
    const image = imageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight) return null;
    const baseScale = Math.max(
      viewportWidth / image.naturalWidth,
      viewportHeight / image.naturalHeight,
    );
    const scale = baseScale * zoom;
    return {
      scale,
      width: image.naturalWidth * scale,
      height: image.naturalHeight * scale,
    };
  };

  const clampOffset = (next: { x: number; y: number }) => {
    const layout = getImageLayout();
    if (!layout) return next;
    return {
      x: Math.min(0, Math.max(viewportWidth - layout.width, next.x)),
      y: Math.min(0, Math.max(viewportHeight - layout.height, next.y)),
    };
  };

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const resetPosition = () => {
      const layout = getImageLayout();
      if (layout) {
        setOffset({
          x: (viewportWidth - layout.width) / 2,
          y: (viewportHeight - layout.height) / 2,
        });
      }
    };
    if (image.complete) resetPosition();
    image.addEventListener("load", resetPosition);
    return () => image.removeEventListener("load", resetPosition);
  }, [src, zoom]);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    offsetStartRef.current = offset;
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setOffset(
      clampOffset({
        x: offsetStartRef.current.x + event.clientX - dragStartRef.current.x,
        y: offsetStartRef.current.y + event.clientY - dragStartRef.current.y,
      }),
    );
  }

  function saveCrop() {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const layout = getImageLayout();
    if (!image || !canvas || !layout) return;

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    const sourceX = Math.max(0, -offset.x / layout.scale);
    const sourceY = Math.max(0, -offset.y / layout.scale);
    const sourceWidth = viewportWidth / layout.scale;
    const sourceHeight = viewportHeight / layout.scale;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    onSave(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/70 p-2 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-3 shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ink">
              {title}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Required output: {outputWidth} × {outputHeight} px. Drag to
              position the image and use the zoom control to adjust the crop.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-page text-muted"
          >
            <X size={15} />
          </button>
        </div>

        <div
          className="relative mx-auto mt-5 w-[320px] cursor-grab touch-none overflow-hidden rounded-none bg-page ring-2 ring-ink active:cursor-grabbing"
          style={{ height: viewportHeight }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <img
            ref={imageRef}
            src={src}
            alt="Crop preview"
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              width: getImageLayout()?.width,
              height: getImageLayout()?.height,
              left: offset.x,
              top: offset.y,
            }}
          />
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-muted">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-ink"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-line px-4 text-xs font-bold text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveCrop}
            className="h-10 rounded-xl bg-ink px-4 text-xs font-bold text-white transition hover:opacity-90"
          >
            Use Cropped Image
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
