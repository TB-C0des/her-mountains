"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTrekButton({
  trekId,
  trekName,
  isCustom,
}: {
  trekId: string;
  trekName: string;
  isCustom: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!isCustom) {
      alert(`"${trekName}" is a built-in trek and can't be removed from here. To remove it, edit data/treks.ts in the codebase.`);
      return;
    }
    if (!confirm(`Remove "${trekName}" from this state?`)) return;
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
      title={isCustom ? "Remove trek" : "Built-in trek (cannot delete from UI)"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "22px", height: "22px", flexShrink: 0,
        background: "rgba(107,95,79,0.1)",
        border: "1px solid rgba(107,95,79,0.25)",
        borderRadius: "50%",
        color: "#6b5f4f",
        fontSize: "0.75rem",
        cursor: deleting ? "not-allowed" : "pointer",
        opacity: deleting ? 0.5 : 1,
        marginRight: "12px",
      }}
    >
      {deleting ? "…" : "×"}
    </button>
  );
}
