import React from "react";

const colors: Record<string, { bg: string; text: string }> = {
  ACTIVE:  { bg: "#052e1620", text: "#4ade80" },
  PAUSED:  { bg: "#2d1b0020", text: "#fb923c" },
  DRAFT:   { bg: "#1e3a5f20", text: "#60a5fa" },
  DELETED: { bg: "#1f0a0a20", text: "#f87171" },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = colors[status] ?? { bg: "#1f293720", text: "#9ca3af" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.text}30`,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}
