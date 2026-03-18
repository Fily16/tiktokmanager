import React, { useState } from "react";
import { useCampaigns, useCampaignAnalytics } from "../api/hooks";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { BarChart2, Brain } from "lucide-react";

const COLORS = ["#ff2d55", "#ff6b35", "#f59e0b", "#4ade80", "#60a5fa", "#a78bfa"];

export default function Analytics() {
  const { data: campaigns = [] } = useCampaigns();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: analytics } = useCampaignAnalytics(selectedId ?? 0);

  // Summary data for all campaigns
  const summaryData = campaigns.map((c) => ({
    name: c.name.slice(0, 18) + (c.name.length > 18 ? "..." : ""),
    roas: c.actual_roas ?? c.predicted_roas ?? 0,
    budget: c.daily_budget_soles,
    status: c.status,
  }));

  const statusDist = Object.entries(
    campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const metrics = analytics?.metrics ?? [];
  const stats = analytics?.statistical_analysis;
  const chartData = metrics.slice(-30).map((m) => ({
    date: new Date(m.recorded_at).toLocaleDateString("es-PE", { month: "short", day: "numeric" }),
    roas: m.roas,
    ctr: m.ctr * 100,
    spend: m.spend_soles,
    conversions: m.conversions,
  }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <BarChart2 size={24} color="#ff2d55" />
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>Analytics</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Análisis estadístico avanzado</p>
        </div>
      </div>

      {/* All campaigns overview */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            ROAS por Campaña
          </h3>
          {summaryData.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 13 }}>Sin campañas disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }}
                  formatter={(v: any) => [`${Number(v).toFixed(2)}x`, "ROAS"]}
                />
                <Bar dataKey="roas" radius={[4, 4, 0, 0]}>
                  {summaryData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.roas >= 2.5 ? "#4ade80" : entry.roas >= 1 ? "#f59e0b" : "#f87171"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            Estado de Campañas
          </h3>
          {statusDist.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 13 }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign-level deep dive */}
      {campaigns.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f9fafb" }}>Análisis Profundo</h2>
            <select
              value={selectedId ?? campaigns[0]?.id ?? ""}
              onChange={(e) => setSelectedId(parseInt(e.target.value))}
              style={{
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: "7px 12px",
                color: "#f9fafb",
                fontSize: 13,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {chartData.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#f9fafb" }}>
                  ROAS Histórico
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }} />
                    <Line type="monotone" dataKey="roas" stroke="#ff2d55" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#f9fafb" }}>
                  CTR % Histórico
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }} formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "CTR"]} />
                    <Line type="monotone" dataKey="ctr" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Statistical insights */}
          {stats && (
            <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Brain size={18} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
                  Insights Estadísticos
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {/* Bayesian */}
                {stats.bayesian_roas && (
                  <div style={{ background: "#0f0f10", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#818cf8", marginBottom: 8, fontWeight: 600 }}>Estimación Bayesiana</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa" }}>
                      {stats.bayesian_roas.posterior_mean?.toFixed(2)}x
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      95% CI: [{stats.bayesian_roas.credible_interval?.[0]?.toFixed(2)} — {stats.bayesian_roas.credible_interval?.[1]?.toFixed(2)}]
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, color: (stats.bayesian_roas.probability_profitable ?? 0) >= 0.6 ? "#4ade80" : "#fb923c" }}>
                      P(rentable): {((stats.bayesian_roas.probability_profitable ?? 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {/* Trend */}
                {stats.trend && (
                  <div style={{ background: "#0f0f10", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 8, fontWeight: 600 }}>Tendencia Temporal</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#f9fafb" }}>
                      {stats.trend.trend_direction === "up" ? "↑ Subiendo" : stats.trend.trend_direction === "down" ? "↓ Bajando" : "→ Estable"}
                    </div>
                    {stats.trend.slope != null && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        Pendiente: {stats.trend.slope?.toFixed(4)}/día
                      </div>
                    )}
                    {stats.trend.anomalies_detected > 0 && (
                      <div style={{ fontSize: 12, color: "#fb923c", marginTop: 6 }}>
                        ⚠ {stats.trend.anomalies_detected} anomalías
                      </div>
                    )}
                  </div>
                )}

                {/* Fatigue */}
                {stats.fatigue && (
                  <div style={{ background: "#0f0f10", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 8, fontWeight: 600 }}>Ad Fatigue (Regresión)</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: stats.fatigue.fatigue_detected ? "#f87171" : "#4ade80" }}>
                      {stats.fatigue.fatigue_detected ? "⚠ Detectada" : "✓ Normal"}
                    </div>
                    {stats.fatigue.fatigue_rate != null && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        Tasa: {stats.fatigue.fatigue_rate?.toFixed(4)}/día
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {campaigns.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
          No hay campañas para analizar
        </div>
      )}
    </div>
  );
}
