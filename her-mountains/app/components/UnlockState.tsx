"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { allIndiaStates } from "../../data/all-india-states";

export default function UnlockState({
  unlockedIds,   // IDs of states already active (base + custom)
}: {
  unlockedIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = allIndiaStates.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleUnlock(stateId: string) {
    setLoading(stateId);
    try {
      const res = await fetch("/api/unlock-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId }),
      });
      const data = await res.json();
      if (data.ok) {
        router.refresh();
        setOpen(false);
      } else {
        alert(data.error ?? "Failed to unlock state.");
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
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            width: "100%", padding: "14px 20px",
            fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em",
            color: "#52705c", background: "rgba(82,112,92,0.06)",
            border: "1.5px dashed rgba(82,112,92,0.35)", borderRadius: "10px",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(82,112,92,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(82,112,92,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(82,112,92,0.06)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(82,112,92,0.35)";
          }}
        >
          <span style={{ fontSize: "1rem" }}>🗺️</span>
          unlock a new state
        </button>
      ) : (
        <div style={{
          borderRadius: "12px", border: "1px solid rgba(43,36,28,0.12)",
          background: "#ece0c4", padding: "20px",
          boxShadow: "0 4px 20px rgba(43,36,28,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontStyle: "italic", color: "#2b241c" }}>
              Unlock a new state
            </p>
            <button onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#6b5f4f", fontSize: "1.2rem", cursor: "pointer" }}>×</button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search states & UTs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 14px", marginBottom: "12px",
              fontFamily: "var(--font-body)", fontSize: "0.88rem",
              border: "1px solid rgba(43,36,28,0.18)", borderRadius: "8px",
              background: "#f5eedd", color: "#2b241c", outline: "none",
            }}
          />

          {/* State grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "8px", maxHeight: "280px", overflowY: "auto",
          }}>
            {filtered.map((s) => {
              const isUnlocked = unlockedIds.includes(s.id);
              const isLoading = loading === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => !isUnlocked && handleUnlock(s.id)}
                  disabled={isUnlocked || isLoading}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: isUnlocked
                      ? "1px solid rgba(82,112,92,0.4)"
                      : "1px solid rgba(43,36,28,0.15)",
                    background: isUnlocked
                      ? "rgba(82,112,92,0.12)"
                      : "rgba(245,238,221,0.7)",
                    color: isUnlocked ? "#52705c" : "#2b241c",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    cursor: isUnlocked ? "default" : "pointer",
                    textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "6px",
                    opacity: isLoading ? 0.6 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{s.name}</span>
                  <span style={{ fontSize: "0.65rem", color: isUnlocked ? "#52705c" : "#6b5f4f", flexShrink: 0 }}>
                    {isLoading ? "…" : isUnlocked ? "✓" : s.type === "ut" ? "UT" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={{
            fontFamily: "var(--font-mono)", fontSize: "0.58rem",
            color: "rgba(43,36,28,0.4)", letterSpacing: "0.1em",
            marginTop: "12px", textAlign: "center",
          }}>
            ✓ already unlocked · UT = Union Territory
          </p>
        </div>
      )}
    </div>
  );
}
