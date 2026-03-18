import React from "react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, color = "#ff2d55", icon }: Props) {
  return (
    <div
      style={{
        background: "#16161a",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </span>
        {icon && <div style={{ color }}>{icon}</div>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#f9fafb" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>}
    </div>
  );
}
