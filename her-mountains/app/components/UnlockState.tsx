"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { allIndiaStates } from "../../data/all-india-states";

export default function UnlockState({ activeIds }: { activeIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [localActive, setLocalActive] = useState<Set<string>>(new Set(activeIds));
  const [search, setSearch] = useState("");

  const filtered = allIndiaStates.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggle(stateId: string) {
    setLoading(stateId);
    try {
      const res = await fetch("/api/unlock-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId }),
      });
      const data = await res.json();
      if (data.ok) {
        setLocalActive((prev) => {
          const next = new Set(prev);
          if (next.has(stateId)) next.delete(stateId); else next.add(stateId);
          return next;
        });
        router.refresh();
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ marginTop: "48px" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px 20px", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", color: "#52705c", background: "rgba(82,112,92,0.06)", border: "1.5px dashed rgba(82,112,92,0.35)", borderRadius: "10px", cursor: "pointer" }}
        >
          <span style={{ fontSize: "1rem" }}>🗺️</span>
          manage states
        </button>
      ) : (
        <div style={{ borderRadius: "12px", border: "1px solid rgba(43,36,28,0.12)", background: "#ece0c4", padding: "20px", boxShadow: "0 4px 20px rgba(43,36,28,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontStyle: "italic", color: "#2b241c" }}>Manage states</p>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#6b5f4f", fontSize: "1.2rem", cursor: "pointer" }}>×</button>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#6b5f4f", letterSpacing: "0.1em", marginBottom: "14px" }}>
            Click to add · click again to remove
          </p>

          <input type="text" placeholder="Search states & UTs…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 14px", marginBottom: "12px", fontFamily: "var(--font-body)", fontSize: "0.88rem", border: "1px solid rgba(43,36,28,0.18)", borderRadius: "8px", background: "#f5eedd", color: "#2b241c", outline: "none" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
            {filtered.map((s) => {
              const isActive = localActive.has(s.id);
              const isLoading = loading === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleToggle(s.id)}
                  disabled={isLoading}
                  style={{
                    padding: "10px 14px", borderRadius: "8px",
                    border: isActive ? "1px solid rgba(82,112,92,0.5)" : "1px solid rgba(43,36,28,0.15)",
                    background: isActive ? "rgba(82,112,92,0.15)" : "rgba(245,238,221,0.7)",
                    color: isActive ? "#3d5445" : "#2b241c",
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    textAlign: "left", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "6px",
                    opacity: isLoading ? 0.55 : 1,
                    transition: "all 0.15s ease",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <span>{s.name}</span>
                  <span style={{ fontSize: "0.65rem", flexShrink: 0, color: isActive ? "#52705c" : "#9e8f7a" }}>
                    {isLoading ? "…" : isActive ? "✓" : s.type === "ut" ? "UT" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(43,36,28,0.38)", letterSpacing: "0.08em", marginTop: "10px", textAlign: "center" }}>
            ✓ active · + not yet added · UT = Union Territory
          </p>
        </div>
      )}
    </div>
  );
}
