import React from "react";
import { Link } from "react-router-dom";
import { useCampaigns, useConfigStatus } from "../api/hooks";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { PlusCircle, TrendingUp, DollarSign, Target, Zap } from "lucide-react";

export default function Dashboard() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: config } = useConfigStatus();

  const active   = campaigns.filter((c) => c.status === "ACTIVE");
  const paused   = campaigns.filter((c) => c.status === "PAUSED");
  const totalSpend = campaigns.reduce((s, c) => s + (c.daily_budget_soles || 0), 0);
  const avgRoas  = active.length
    ? active.reduce((s, c) => s + (c.actual_roas || c.predicted_roas || 0), 0) / active.length
    : 0;

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
            Resumen de tus campañas TikTok Ads
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
            padding: "10px 20px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <PlusCircle size={16} />
          Nueva Campaña
        </Link>
      </div>

      {/* Config warning */}
      {!config?.is_ready && (
        <div
          style={{
            background: "#2d1b0020",
            border: "1px solid #d9770640",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Zap size={18} color="#fb923c" />
          <span style={{ color: "#fb923c", fontSize: 14 }}>
            Configura tus API keys para comenzar.{" "}
            <Link to="/settings" style={{ color: "#fbbf24", fontWeight: 600 }}>
              Ir a Configuración →
            </Link>
          </span>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Campañas Activas"
          value={active.length}
          sub={`${paused.length} pausadas`}
          color="#4ade80"
          icon={<Target size={18} />}
        />
        <StatCard
          label="Total Campañas"
          value={campaigns.length}
          color="#60a5fa"
          icon={<Zap size={18} />}
        />
        <StatCard
          label="Presupuesto Diario"
          value={`S/ ${totalSpend.toFixed(0)}`}
          sub="suma activas"
          color="#f59e0b"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="ROAS Promedio"
          value={avgRoas > 0 ? `${avgRoas.toFixed(2)}x` : "—"}
          sub="campañas activas"
          color={avgRoas >= 2.5 ? "#4ade80" : avgRoas >= 1 ? "#f59e0b" : "#f87171"}
          icon={<TrendingUp size={18} />}
        />
      </div>

      {/* Recent campaigns */}
      <div
        style={{
          background: "#16161a",
          border: "1px solid #1f2937",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1f2937" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f9fafb" }}>
            Campañas Recientes
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Cargando...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            No hay campañas aún.{" "}
            <Link to="/campaign/new" style={{ color: "#ff2d55" }}>
              Crear primera campaña
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f0f10" }}>
                {["Nombre", "Estado", "Presupuesto/día", "ROAS Pred.", "ROAS Real", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 24px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "#6b7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 10).map((c) => (
                <tr
                  key={c.id}
                  style={{ borderTop: "1px solid #1f2937" }}
                >
                  <td style={{ padding: "14px 24px", color: "#f9fafb", fontSize: 14, maxWidth: 250 }}>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: "14px 24px", color: "#d1d5db", fontSize: 14 }}>
                    S/ {c.daily_budget_soles}
                  </td>
                  <td style={{ padding: "14px 24px", color: "#60a5fa", fontSize: 14 }}>
                    {c.predicted_roas ? `${c.predicted_roas.toFixed(2)}x` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "14px 24px",
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
                  <td style={{ padding: "14px 24px" }}>
                    <Link
                      to={`/campaign/${c.id}`}
                      style={{
                        color: "#ff2d55",
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Ver →
                    </Link>
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
