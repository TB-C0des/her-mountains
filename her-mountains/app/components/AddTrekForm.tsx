"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTrek } from "../actions/add-trek";

export default function AddTrekForm({ stateId, stateName }: { stateId: string; stateName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.append("stateId", stateId);
    fd.append("stateName", stateName);

    startTransition(async () => {
      const result = await addTrek(fd);
      if (result.ok) {
        router.refresh(); // re-fetch server data so new trek appears
        setOpen(false);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(43,36,28,0.18)",
    background: "#f5eedd",
    color: "#2b241c",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.58rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#6b5f4f",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{ marginTop: "32px" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
            color: "#3e5169",
            background: "none",
            border: "1px dashed rgba(62,81,105,0.4)",
            borderRadius: "8px",
            padding: "12px 20px",
            cursor: "pointer",
            width: "100%",
            justifyContent: "center",
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#3e5169";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(62,81,105,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(62,81,105,0.4)";
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
        >
          <span style={{ fontSize: "1rem" }}>＋</span>
          add a new trek
        </button>
      ) : (
        <div style={{
          borderRadius: "12px",
          border: "1px solid rgba(43,36,28,0.14)",
          background: "#ece0c4",
          padding: "24px 24px 20px",
          boxShadow: "0 4px 20px rgba(43,36,28,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontStyle: "italic", color: "#2b241c" }}>
              Add a trek in {stateName}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#6b5f4f", fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}
            >×</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Trek name *</label>
              <input name="name" required placeholder="e.g. Kumara Parvatha" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>A personal note for her</label>
              <textarea
                name="yourLine"
                placeholder="Something you want her to remember about this trek…"
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>A memory prompt</label>
              <input
                name="prompt"
                placeholder="e.g. What surprised you on the trail?"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#c97b4b" }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: isPending ? "rgba(62,81,105,0.5)" : "#3e5169",
                  color: "#f5eedd",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending ? "saving…" : "save trek"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(43,36,28,0.2)",
                  background: "transparent",
                  color: "#6b5f4f",
                  cursor: "pointer",
                }}
              >
                cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
