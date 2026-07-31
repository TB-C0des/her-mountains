"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditStateContent({
  stateId,
  initialTagline,
}: {
  stateId: string;
  initialTagline: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);  const [tagline, setTagline] = useState(initialTagline);
  const [savingTagline, setSavingTagline] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSaveTagline() {
    if (!tagline.trim()) return;
    setSavingTagline(true);
    setMsg(null);
    try {
      const res = await fetch("/api/edit-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId, tagline }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Saved! Refreshing…");
        setTimeout(() => { router.refresh(); setOpen(false); setMsg(null); }, 1200);
      } else {
        setMsg("Error: " + (data.error ?? "unknown"));
      }
    } finally {
      setSavingTagline(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setMsg(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    updateHeroDom(localUrl);

    const fd = new FormData();
    fd.append("stateId", stateId);
    fd.append("photos", file);
    try {
      const res = await fetch("/api/upload-state-cover", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        if (data.url) updateHeroDom(data.url);
        setMsg("Cover updated!");
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg("Error: " + (data.error ?? "upload failed"));
        updateHeroDom(null);
      }
    } finally {
      setUploadingCover(false);
      if (fileRef.current) fileRef.current.value = "";
      URL.revokeObjectURL(localUrl);
    }
  }

  function updateHeroDom(url: string | null) {
    if (!url) return;
    const hero = document.querySelector<HTMLDivElement>("[data-state-hero]");
    if (hero) hero.style.backgroundImage = `url(${url})`;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#6b5f4f", cursor: "pointer", letterSpacing: "0.1em", padding: "4px 0", textDecoration: "underline dotted", textUnderlineOffset: "3px", marginTop: "4px" }}
      >
        ✎ edit this page
      </button>
    );
  }

  return (
    <div style={{ borderRadius: "12px", border: "1px solid rgba(43,36,28,0.14)", background: "#ece0c4", padding: "20px 24px", marginBottom: "24px", boxShadow: "0 4px 20px rgba(43,36,28,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontStyle: "italic", color: "#2b241c" }}>Edit this state page</p>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#6b5f4f", fontSize: "1.2rem", cursor: "pointer" }}>×</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Tagline */}
        <div>
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#6b5f4f", marginBottom: "6px", display: "block" }}>
            Tagline / caption
          </label>
          <textarea
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: "0.9rem", border: "1px solid rgba(43,36,28,0.18)", borderRadius: "8px", background: "#f5eedd", color: "#2b241c", outline: "none", resize: "vertical" }}
          />
          <button
            onClick={handleSaveTagline}
            disabled={savingTagline}
            style={{ marginTop: "8px", padding: "10px 20px", borderRadius: "8px", border: "none", background: savingTagline ? "rgba(62,81,105,0.5)" : "#3e5169", color: "#f5eedd", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", cursor: savingTagline ? "not-allowed" : "pointer" }}
          >
            {savingTagline ? "saving…" : "save tagline"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(43,36,28,0.12)" }} />

        {/* Cover photo */}
        <div>
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#6b5f4f", marginBottom: "6px", display: "block" }}>
            Hero cover photo
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "1.5px dashed rgba(43,36,28,0.22)", background: "rgba(245,238,221,0.6)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#6b5f4f", cursor: uploadingCover ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}>
            {uploadingCover ? "uploading…" : "📷 choose new cover"}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleCoverUpload} disabled={uploadingCover} />
          </label>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#6b5f4f", marginTop: "6px" }}>
            JPG, PNG or WebP · replaces the current cover
          </p>
        </div>

        {msg && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: msg.startsWith("Error") ? "#c97b4b" : "#52705c" }}>{msg}</p>
        )}
      </div>
    </div>
  );
}
