"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTrekButton({ trekId, trekName }: { trekId: string; trekName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${trekName}" from this state? This only removes it from the custom treks list.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-trek", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trekId }),
      });
      const data = await res.json();
      if (data.ok) router.refresh();
      else alert("Delete failed: " + data.error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
      disabled={deleting}
      title="Remove trek"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "22px", height: "22px", flexShrink: 0,
        background: "rgba(201,123,75,0.15)", border: "1px solid rgba(201,123,75,0.3)",
        borderRadius: "50%", color: "#c97b4b", fontSize: "0.75rem",
        cursor: deleting ? "not-allowed" : "pointer",
        opacity: deleting ? 0.5 : 1,
        marginRight: "12px",
      }}
    >
      {deleting ? "…" : "×"}
    </button>
  );
}
