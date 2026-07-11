"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

const rotations = [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5];

export default function TrekGallery({
  photos,
  trekName,
  trekId,
}: {
  photos: string[];
  trekName: string;
  trekId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (open === null) return;
    if (e.key === "Escape") setOpen(null);
    if (e.key === "ArrowRight") setOpen((i) => (i! + 1) % photos.length);
    if (e.key === "ArrowLeft") setOpen((i) => (i! - 1 + photos.length) % photos.length);
  }, [open, photos.length]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleDeletePhoto(src: string) {
    const filename = src.split("/").pop();
    if (!filename || !confirm(`Delete this photo?`)) return;
    setDeleting(src);
    try {
      const res = await fetch("/api/delete-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trekId, filename }),
      });
      const data = await res.json();
      if (data.ok) router.refresh();
      else alert("Delete failed: " + data.error);
    } finally {
      setDeleting(null);
    }
  }

  if (photos.length === 0) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontStyle: "italic", color: "#6b5f4f" }}>
        No photos added yet.
      </p>
    );
  }

  return (
    <>
      {/* Polaroid grid */}
      <div className="grid grid-cols-2 gap-8 pb-2">
        {photos.map((src, i) => (
          <div key={src} style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={() => setOpen(i)}
              className="polaroid"
              style={{ transform: `rotate(${rotations[i % rotations.length]}deg)`, textAlign: "left", width: "100%" }}
            >
              <div style={{ height: "220px", backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#ece0c4" }} />
              <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.85rem", color: "#6b5f4f", marginTop: "8px", paddingLeft: "2px" }}>
                {trekName}
              </p>
            </button>
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDeletePhoto(src); }}
              disabled={deleting === src}
              title="Delete photo"
              style={{
                position: "absolute", top: "4px", right: "4px",
                background: "rgba(43,36,28,0.65)", border: "none",
                borderRadius: "50%", width: "24px", height: "24px",
                color: "#f5eedd", fontSize: "0.7rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: deleting === src ? 0.5 : 1, zIndex: 2,
              }}
            >
              {deleting === src ? "…" : "×"}
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          className="lightbox-backdrop"
          onClick={() => setOpen(null)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(20,16,12,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen((i) => (i! - 1 + photos.length) % photos.length); }}
              style={{ position: "fixed", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,238,221,0.7)", fontFamily: "var(--font-mono)", fontSize: "1.8rem", background: "none", border: "none", cursor: "pointer", zIndex: 10000 }}>‹</button>
          )}

          <div className="polaroid" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(80vw, 520px)", padding: "10px 10px 36px 10px", transform: "rotate(0deg)", cursor: "default", position: "relative", zIndex: 10000 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[open]} alt={`${trekName} — photo ${open + 1}`}
              style={{ display: "block", width: "100%", maxHeight: "65vh", objectFit: "contain", backgroundColor: "#ece0c4" }} />
            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.8rem", color: "#6b5f4f", marginTop: "8px", textAlign: "center" }}>
              {trekName} · {open + 1} / {photos.length}
            </p>
          </div>

          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen((i) => (i! + 1) % photos.length); }}
              style={{ position: "fixed", right: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,238,221,0.7)", fontFamily: "var(--font-mono)", fontSize: "1.8rem", background: "none", border: "none", cursor: "pointer", zIndex: 10000 }}>›</button>
          )}

          <p style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(245,238,221,0.35)", letterSpacing: "0.1em", zIndex: 10000, whiteSpace: "nowrap" }}>
            esc to close · ← → to navigate
          </p>
        </div>
      )}
    </>
  );
}
