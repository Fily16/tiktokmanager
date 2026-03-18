import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns, useToggleCampaign } from "../api/hooks";
import StatusBadge from "../components/StatusBadge";
import { PlusCircle, Pause, Play, Search } from "lucide-react";

export default function Campaigns() {
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const toggle = useToggleCampaign();
  const [search, setSearch] = useState("");

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: number, status: string) => {
    const action = status === "ACTIVE" ? "pause" : "activate";
    toggle.mutate({ id, action }, { onSuccess: () => refetch() });
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>Campañas</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
            {campaigns.length} campañas total
          </p>
        </div>
        <Link
          to="/campaign/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <PlusCircle size={16} />
          Nueva
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
        <Search
          size={16}
          color="#6b7280"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          placeholder="Buscar campaña..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#16161a",
            border: "1px solid #374151",
            borderRadius: 8,
            padding: "9px 14px 9px 36px",
            color: "#f9fafb",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          background: "#16161a",
          border: "1px solid #1f2937",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#6b7280" }}>Cargando campañas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#6b7280" }}>
            {search ? "Sin resultados" : "No hay campañas. Crea la primera."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f0f10" }}>
                {["Campaña", "Estado", "Objetivo", "Presup./día", "ROAS Pred.", "ROAS Real", "Auto", "Acciones"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "#6b7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #1f2937" }}>
                  <td style={{ padding: "14px 20px", maxWidth: 220 }}>
                    <div style={{ fontWeight: 500, color: "#f9fafb", fontSize: 14 }}>
                      {c.name}
                    </div>
                    {c.tiktok_campaign_id && (
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                        TT: {c.tiktok_campaign_id.slice(0, 12)}...
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: "14px 20px", color: "#9ca3af", fontSize: 13 }}>
                    {c.objective}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#d1d5db", fontSize: 14 }}>
                    S/ {c.daily_budget_soles}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#60a5fa", fontSize: 14 }}>
                    {c.predicted_roas ? `${c.predicted_roas.toFixed(2)}x` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: 14,
                      color:
                        (c.actual_roas ?? 0) >= 2.5
                          ? "#4ade80"
                          : (c.actual_roas ?? 0) >= 1
                          ? "#f59e0b"
                          : "#f87171",
                    }}
                  >
                    {c.actual_roas ? `${c.actual_roas.toFixed(2)}x` : "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: c.auto_optimize ? "#4ade80" : "#6b7280",
                        background: c.auto_optimize ? "#052e1620" : "#1f293720",
                        border: `1px solid ${c.auto_optimize ? "#16a34a30" : "#37415130"}`,
                        borderRadius: 12,
                        padding: "2px 8px",
                      }}
                    >
                      {c.auto_optimize ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleToggle(c.id, c.status)}
                        disabled={toggle.isPending}
                        style={{
                          background: "#1f2937",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 10px",
                          cursor: "pointer",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title={c.status === "ACTIVE" ? "Pausar" : "Activar"}
                      >
                        {c.status === "ACTIVE" ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <Link
                        to={`/campaign/${c.id}`}
                        style={{
                          background: "#1f2937",
                          borderRadius: 6,
                          padding: "6px 10px",
                          color: "#9ca3af",
                          textDecoration: "none",
                          fontSize: 12,
                        }}
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
