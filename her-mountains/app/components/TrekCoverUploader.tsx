"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrekCoverUploader({ trekId }: { trekId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);

    const fd = new FormData();
    fd.append("trekId", trekId);
    fd.append("photos", file);

    try {
      const res = await fetch("/api/upload-trek-cover", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setMsg("Cover updated! Refreshing…");
        setTimeout(() => { router.refresh(); setMsg(null); }, 1400);
      } else {
        setMsg("Error: " + (data.error ?? "upload failed"));
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ marginTop: "16px" }}>
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
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: msg.startsWith("Error") ? "#c97b4b" : "#52705c", marginTop: "6px" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
