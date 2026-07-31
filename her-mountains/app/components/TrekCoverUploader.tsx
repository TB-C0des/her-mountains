"use client";

import { useRef, useState } from "react";

export default function TrekCoverUploader({ trekId }: { trekId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);

    // Show a local preview immediately while uploading
    const localUrl = URL.createObjectURL(file);
    updateHeroDom(localUrl);

    const fd = new FormData();
    fd.append("trekId", trekId);
    fd.append("photos", file);

    try {
      const res = await fetch("/api/upload-trek-cover", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        // Replace local blob URL with the GitHub raw URL the server returned
        if (data.url) updateHeroDom(data.url);
        setMsg("✓ Cover updated");
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg("Error: " + (data.error ?? "upload failed"));
        // Revert preview on error
        updateHeroDom(null);
      }
    } catch {
      setMsg("Network error — please try again.");
      updateHeroDom(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      URL.revokeObjectURL(localUrl);
    }
  }

  /** Update the hero background-image on the page without a full reload */
  function updateHeroDom(url: string | null) {
    if (!url) return;
    // The hero div is the first child of <main> — find it by its data attribute
    const hero = document.querySelector<HTMLDivElement>("[data-trek-hero]");
    if (hero) hero.style.backgroundImage = `url(${url})`;
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontFamily: "var(--font-mono)", fontSize: "0.6rem",
          color: "#6b5f4f", cursor: uploading ? "not-allowed" : "pointer",
          letterSpacing: "0.1em",
          textDecoration: "underline dotted",
          textUnderlineOffset: "3px",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? "uploading…" : "✎ change cover photo"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleChange}
          disabled={uploading}
        />
      </label>
      {msg && (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.78rem",
          color: msg.startsWith("Error") || msg.startsWith("Network") ? "#c97b4b" : "#52705c",
          marginTop: "6px",
        }}>
          {msg}
        </p>
      )}
    </div>
  );
}
