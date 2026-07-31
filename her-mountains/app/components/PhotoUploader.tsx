"use client";

import { useRef, useState } from "react";

export default function PhotoUploader({ trekId }: { trekId: string }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files);
    setMessage(null);
  }

  async function handleUpload() {
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage(null);

    const fd = new FormData();
    fd.append("trekId", trekId);
    for (const file of Array.from(files)) {
      fd.append("photos", file);
    }

    try {
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      const data = await res.json();

      if (data.ok) {
        setMessage({ type: "ok", text: `${data.uploaded} photo${data.uploaded !== 1 ? "s" : ""} uploaded! Refresh to see them in the gallery.` });
        setFiles(null);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setMessage({ type: "error", text: data.error ?? "Upload failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error — please try again." });
    } finally {
      setUploading(false);
    }
  }

  const fileCount = files ? files.length : 0;

  return (
    <div style={{ marginTop: "48px" }}>
      {/* Section divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <span style={{ flex: 1, height: "1px", background: "rgba(43,36,28,0.12)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b5f4f", whiteSpace: "nowrap" }}>
          add photos
        </span>
        <span style={{ flex: 1, height: "1px", background: "rgba(43,36,28,0.12)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Drop zone / file picker */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "28px 20px",
            borderRadius: "10px",
            border: `1.5px dashed ${fileCount > 0 ? "#52705c" : "rgba(43,36,28,0.22)"}`,
            background: fileCount > 0 ? "rgba(82,112,92,0.06)" : "rgba(236,224,196,0.4)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{fileCount > 0 ? "✅" : "📷"}</span>
          {fileCount > 0 ? (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#52705c", fontWeight: 500 }}>
              {fileCount} photo{fileCount !== 1 ? "s" : ""} selected
            </span>
          ) : (
            <>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#6b5f4f", letterSpacing: "0.1em" }}>
                click to select photos
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(43,36,28,0.4)" }}>
                JPG, PNG, WebP · select multiple
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Upload button — only shown when files are selected */}
        {fileCount > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: uploading ? "rgba(62,81,105,0.55)" : "#3e5169",
              color: "#f5eedd",
              cursor: uploading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
            }}
          >
            {uploading ? "uploading…" : `upload ${fileCount} photo${fileCount !== 1 ? "s" : ""}`}
          </button>
        )}

        {/* Feedback */}
        {message && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: message.type === "ok" ? "#52705c" : "#c97b4b",
            padding: "12px 16px",
            borderRadius: "8px",
            background: message.type === "ok" ? "rgba(82,112,92,0.08)" : "rgba(201,123,75,0.08)",
            border: `1px solid ${message.type === "ok" ? "rgba(82,112,92,0.2)" : "rgba(201,123,75,0.2)"}`,
            margin: 0,
          }}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
