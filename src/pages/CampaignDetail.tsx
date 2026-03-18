import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCampaign, useToggleCampaign, useCampaignAnalytics,
} from "../api/hooks";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ArrowLeft, Pause, Play, TrendingUp, Activity, Brain } from "lucide-react";

const fmt = (n: number | null | undefined, prefix = "", suffix = "", dec = 2) =>
  n != null ? `${prefix}${n.toFixed(dec)}${suffix}` : "—";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || "0");
  const navigate = useNavigate();

  const { data: campaign, isLoading: loadingCampaign } = useCampaign(campaignId);
  const { data: analytics, isLoading: loadingAnalytics } = useCampaignAnalytics(campaignId);
  const toggle = useToggleCampaign();

  if (loadingCampaign) {
    return <div style={{ padding: 32, color: "#6b7280" }}>Cargando campaña...</div>;
  }
  if (!campaign) {
    return <div style={{ padding: 32, color: "#f87171" }}>Campaña no encontrada</div>;
  }

  const metrics = analytics?.metrics ?? [];
  const stats = analytics?.statistical_analysis;
  const decisions = analytics?.decisions ?? [];

  const chartData = metrics.slice(-20).map((m) => ({
    time: new Date(m.recorded_at).toLocaleDateString("es-PE", { month: "short", day: "numeric" }),
    roas: m.roas,
    ctr: m.ctr,
    spend: m.spend_soles,
    conversions: m.conversions,
  }));

  const handleToggle = () => {
    const action = campaign.status === "ACTIVE" ? "pause" : "activate";
    toggle.mutate({ id: campaignId, action });
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => navigate("/campaigns")}
          style={{ background: "#1f2937", border: "none", borderRadius: 8, padding: "8px 12px", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
            {campaign.name}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <StatusBadge status={campaign.status} />
            {campaign.tiktok_campaign_id && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                TikTok ID: {campaign.tiktok_campaign_id}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggle.isPending}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: campaign.status === "ACTIVE" ? "#2d1b0020" : "#052e1620",
            border: `1px solid ${campaign.status === "ACTIVE" ? "#d9770640" : "#16a34a40"}`,
            color: campaign.status === "ACTIVE" ? "#fb923c" : "#4ade80",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {campaign.status === "ACTIVE" ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Activar</>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="ROAS Predicho" value={fmt(campaign.predicted_roas, "", "x")} color="#60a5fa" icon={<TrendingUp size={16} />} />
        <StatCard label="ROAS Real" value={fmt(campaign.actual_roas, "", "x")} color={campaign.actual_roas != null && campaign.actual_roas >= 2.5 ? "#4ade80" : "#f59e0b"} icon={<Activity size={16} />} />
        <StatCard label="Pres. Diario" value={fmt(campaign.daily_budget_soles, "S/ ", "", 0)} color="#f59e0b" />
        <StatCard label="Pres. Total" value={campaign.total_budget_soles ? fmt(campaign.total_budget_soles, "S/ ", "", 0) : "—"} color="#a78bfa" />
        <StatCard label="Auto-Optimize" value={campaign.auto_optimize ? "Activo" : "Inactivo"} color={campaign.auto_optimize ? "#4ade80" : "#6b7280"} />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            ROAS en el tiempo
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }}
              />
              <ReferenceLine y={1} stroke="#f87171" strokeDasharray="4 4" label={{ value: "Break-even", fill: "#f87171", fontSize: 10 }} />
              <ReferenceLine y={2.5} stroke="#4ade80" strokeDasharray="4 4" label={{ value: "Scale 2.5x", fill: "#4ade80", fontSize: 10 }} />
              <Line type="monotone" dataKey="roas" stroke="#ff2d55" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Statistical analysis */}
        {stats && (
          <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Brain size={18} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
                Análisis Estadístico
              </h3>
            </div>

            {stats.bayesian_roas && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>ROAS Bayesiano</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>
                  {stats.bayesian_roas.posterior_mean?.toFixed(2)}x
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  CI: [{stats.bayesian_roas.credible_interval?.[0]?.toFixed(2)} — {stats.bayesian_roas.credible_interval?.[1]?.toFixed(2)}]
                </div>
                <div style={{ fontSize: 12, color: stats.bayesian_roas.probability_profitable >= 0.6 ? "#4ade80" : "#fb923c", marginTop: 4 }}>
                  P(rentable): {((stats.bayesian_roas.probability_profitable ?? 0) * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {stats.trend && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Tendencia</div>
                <div style={{ fontSize: 13, color: "#d1d5db" }}>
                  Dirección: <span style={{ color: stats.trend.trend_direction === "up" ? "#4ade80" : stats.trend.trend_direction === "down" ? "#f87171" : "#6b7280" }}>
                    {stats.trend.trend_direction === "up" ? "↑ Subiendo" : stats.trend.trend_direction === "down" ? "↓ Bajando" : "→ Estable"}
                  </span>
                </div>
                {stats.trend.anomalies_detected > 0 && (
                  <div style={{ fontSize: 12, color: "#fb923c", marginTop: 4 }}>
                    ⚠ {stats.trend.anomalies_detected} anomalías detectadas
                  </div>
                )}
              </div>
            )}

            {stats.fatigue && (
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Ad Fatigue</div>
                <div style={{ fontSize: 13, color: stats.fatigue.fatigue_detected ? "#f87171" : "#4ade80" }}>
                  {stats.fatigue.fatigue_detected ? "⚠ Fatiga detectada" : "✓ Sin fatiga"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decisions log */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            Decisiones Automáticas
          </h3>
          {decisions.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 13 }}>Sin decisiones aún</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {decisions.slice(0, 8).map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: "#0f0f10",
                    borderRadius: 8,
                    padding: "10px 14px",
                    borderLeft: `3px solid ${
                      d.decision_type === "PAUSE" ? "#f87171" :
                      d.decision_type === "SCALE" ? "#4ade80" : "#60a5fa"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          d.decision_type === "PAUSE" ? "#f87171" :
                          d.decision_type === "SCALE" ? "#4ade80" : "#60a5fa",
                      }}
                    >
                      {d.decision_type}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      {new Date(d.created_at).toLocaleDateString("es-PE")}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{d.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loadingAnalytics && (
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 16 }}>Cargando analytics...</p>
      )}
    </div>
  );
}
