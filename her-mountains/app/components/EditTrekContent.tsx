"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  fontFamily: "var(--font-body)", fontSize: "0.9rem",
  border: "1px solid rgba(43,36,28,0.18)", borderRadius: "8px",
  background: "#f5eedd", color: "#2b241c", outline: "none",
  resize: "vertical" as const,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "0.58rem",
  letterSpacing: "0.18em", textTransform: "uppercase" as const,
  color: "#6b5f4f", marginBottom: "6px", display: "block",
};

export default function EditTrekContent({
  trekId,
  initialYourLines,
  initialPrompts,
}: {
  trekId: string;
  initialYourLines: string[];
  initialPrompts: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [yourLines, setYourLines] = useState(initialYourLines.join("\n"));
  const [prompts, setPrompts] = useState(initialPrompts.join("\n"));
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/edit-trek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trekId,
          yourLines: yourLines.split("\n").map((l) => l.trim()).filter(Boolean),
          prompts:   prompts.split("\n").map((l) => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Saved! Refreshing…");
        setTimeout(() => { router.refresh(); setOpen(false); setMsg(null); }, 1200);
      } else {
        setMsg("Error: " + (data.error ?? "unknown"));
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#6b5f4f", cursor: "pointer", letterSpacing: "0.1em", padding: "4px 0", textDecoration: "underline dotted", textUnderlineOffset: "3px" }}
      >
        ✎ edit
      </button>
    );
  }

  return (
    <div style={{ borderRadius: "12px", border: "1px solid rgba(43,36,28,0.14)", background: "#ece0c4", padding: "20px 24px", marginTop: "12px", boxShadow: "0 4px 20px rgba(43,36,28,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontStyle: "italic", color: "#2b241c" }}>Edit trek content</p>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#6b5f4f", fontSize: "1.2rem", cursor: "pointer" }}>×</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>A note for you (one per line)</label>
          <textarea value={yourLines} onChange={(e) => setYourLines(e.target.value)} rows={3} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Memory corner prompts (one per line)</label>
          <textarea value={prompts} onChange={(e) => setPrompts(e.target.value)} rows={4} style={inputStyle} />
        </div>

        {msg && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: msg.startsWith("Error") ? "#c97b4b" : "#52705c" }}>{msg}</p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: saving ? "rgba(62,81,105,0.5)" : "#3e5169", color: "#f5eedd", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "saving…" : "save changes"}
          </button>
          <button onClick={() => setOpen(false)}
            style={{ padding: "11px 18px", borderRadius: "8px", border: "1px solid rgba(43,36,28,0.2)", background: "transparent", color: "#6b5f4f", fontFamily: "var(--font-mono)", fontSize: "0.68rem", cursor: "pointer" }}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
