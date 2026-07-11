"use client";

import { useState, useCallback, useEffect } from "react";

export default function TrekGallery({
  photos,
  trekName,
}: {
  photos: string[];
  trekName: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  // Keyboard navigation
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i! + 1) % photos.length);
      if (e.key === "ArrowLeft")
        setOpen((i) => (i! - 1 + photos.length) % photos.length);
    },
    [open, photos.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Lock scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const rotations = [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5];

  if (photos.length === 0) {
    return (
      <p
        className="text-sm italic"
        style={{ color: "var(--color-ink-soft)" }}
      >
        No photos added yet.
      </p>
    );
  }

  return (
    <>
      {/* Polaroid grid */}
      <div className="grid grid-cols-2 gap-8 pb-2">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className="polaroid"
            style={{
              transform: `rotate(${rotations[i % rotations.length]}deg)`,
              textAlign: "left",
            }}
          >
            <div
              style={{
                height: "220px",
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "var(--color-paper-dark)",
              }}
            />
            {/* Handwritten-style label */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: "#6b5f4f",
                marginTop: "8px",
                paddingLeft: "2px",
              }}
            >
              {trekName}
            </p>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          className="lightbox-backdrop"
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,16,12,0.88)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i! - 1 + photos.length) % photos.length);
              }}
              style={{
                position: "absolute",
                left: "16px",
                color: "rgba(245,238,221,0.7)",
                fontFamily: "var(--font-mono)",
                fontSize: "1.4rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
              }}
            >
              ‹
            </button>
          )}

          {/* Photo */}
          <div
            className="polaroid"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(80vw, 520px)",
              padding: "10px 10px 36px 10px",
              transform: "rotate(0deg)",
              cursor: "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[open]}
              alt={`${trekName} — photo ${open + 1}`}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                backgroundColor: "var(--color-paper-dark)",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "0.8rem",
                color: "#9e8f7a",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              {trekName} · {open + 1} / {photos.length}
            </p>
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i! + 1) % photos.length);
              }}
              style={{
                position: "absolute",
                right: "16px",
                color: "rgba(245,238,221,0.7)",
                fontFamily: "var(--font-mono)",
                fontSize: "1.4rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
              }}
            >
              ›
            </button>
          )}

          {/* Close hint */}
          <p
            style={{
              position: "absolute",
              bottom: "16px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "rgba(245,238,221,0.35)",
              letterSpacing: "0.1em",
            }}
          >
            esc to close · ← → to navigate
          </p>
        </div>
      )}
    </>
  );
}
