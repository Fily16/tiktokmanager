import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCampaign, useToggleCampaign, useCampaignAnalytics, useSyncMetrics,
} from "../api/hooks";
import StatusBadge from "../components/StatusBadge";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowLeft, Pause, Play, TrendingUp, Activity, Brain, RefreshCw,
  Eye, MousePointerClick, ShoppingCart, DollarSign, Target, Zap,
  BarChart3, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";

const fmt = (n: number | null | undefined, prefix = "", suffix = "", dec = 2) =>
  n != null && !isNaN(n) ? `${prefix}${n.toFixed(dec)}${suffix}` : "\u2014";

const fmtInt = (n: number | null | undefined) =>
  n != null ? n.toLocaleString("es-PE") : "\u2014";

// Animated progress bar
function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#f9fafb", fontWeight: 600 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, background: "#1f2937", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            borderRadius: 4,
            transition: "width 1s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}

// Metric card with icon and trend
function MetricCard({ label, value, sub, icon, color, trend }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div style={{
      background: "#16161a", border: "1px solid #1f2937", borderRadius: 14,
      padding: "18px 20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10, width: 60, height: 60,
        background: `${color}10`, borderRadius: "50%",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </span>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#f9fafb", display: "flex", alignItems: "center", gap: 8 }}>
        {value}
        {trend && trend !== "neutral" && (
          <span style={{ fontSize: 14, color: trend === "up" ? "#4ade80" : "#f87171" }}>
            {trend === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// Section header
function SectionTitle({ icon, title, color = "#f9fafb" }: { icon: React.ReactNode; title: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ color }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color }}>{title}</h3>
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || "0");
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<"roas" | "ctr" | "spend" | "funnel">("roas");

  const { data: campaign, isLoading: loadingCampaign } = useCampaign(campaignId);
  const { data: analytics, isLoading: loadingAnalytics } = useCampaignAnalytics(campaignId);
  const toggle = useToggleCampaign();
  const sync = useSyncMetrics();

  if (loadingCampaign) {
    return <div style={{ padding: 32, color: "#6b7280" }}>Cargando...</div>;
  }
  if (!campaign) {
    return <div style={{ padding: 32, color: "#f87171" }}>No encontrada</div>;
  }

  const metrics = analytics?.metrics ?? [];
  const stats = analytics?.statistical_analysis;
  const decisions = analytics?.decisions ?? [];
  const analyticsCampaign = analytics?.campaign;

  // Latest metric (most recent data from TikTok)
  const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  // Totals across all metric records
  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalConversions = metrics.reduce((s, m) => s + (m.conversions || 0), 0);
  const totalSpend = metrics.reduce((s, m) => s + (m.spend_soles || 0), 0);
  const totalRevenue = metrics.reduce((s, m) => s + (m.revenue_soles || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const actualRoas = analyticsCampaign?.actual_roas ?? campaign.actual_roas;

  const chartData = metrics.slice(-30).map((m) => ({
    time: new Date(m.recorded_at).toLocaleDateString("es-PE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    roas: m.roas || 0,
    ctr: (m.ctr || 0) * 100,
    spend: m.spend_soles || 0,
    impressions: m.impressions || 0,
    clicks: m.clicks || 0,
    conversions: m.conversions || 0,
    cpc: m.cpc || m.cpc_soles || 0,
    cpm: m.cpm || m.cpm_soles || 0,
  }));

  // Budget usage
  const budgetUsed = totalSpend;
  const budgetTotal = campaign.total_budget_soles || 50;
  const budgetPct = (budgetUsed / budgetTotal) * 100;

  // Funnel data for pie chart
  const funnelData = [
    { name: "Impresiones", value: totalImpressions, color: "#60a5fa" },
    { name: "Clicks", value: totalClicks, color: "#f59e0b" },
    { name: "Conversiones", value: totalConversions, color: "#4ade80" },
  ].filter(d => d.value > 0);

  const handleToggle = () => {
    const action = campaign.status === "ACTIVE" ? "pause" : "activate";
    toggle.mutate({ id: campaignId, action });
  };

  const handleSync = () => {
    sync.mutate(campaignId);
  };

  const hasData = metrics.length > 0;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate("/campaigns")}
          style={{ background: "#1f2937", border: "none", borderRadius: 8, padding: "8px 12px", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>{campaign.name}</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <StatusBadge status={campaign.status} />
            {campaign.tiktok_campaign_id && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>TikTok ID: {campaign.tiktok_campaign_id}</span>
            )}
          </div>
        </div>
        <button onClick={handleSync} disabled={sync.isPending}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#1e3a5f30", border: "1px solid #3b82f640",
            color: "#60a5fa", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
          <RefreshCw size={14} className={sync.isPending ? "animate-spin" : ""} style={sync.isPending ? { animation: "spin 1s linear infinite" } : {}} />
          {sync.isPending ? "Sincronizando..." : "Sync TikTok"}
        </button>
        <button onClick={handleToggle} disabled={toggle.isPending}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: campaign.status === "ACTIVE" ? "#2d1b0020" : "#052e1620",
            border: `1px solid ${campaign.status === "ACTIVE" ? "#d9770640" : "#16a34a40"}`,
            color: campaign.status === "ACTIVE" ? "#fb923c" : "#4ade80",
            borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
          {campaign.status === "ACTIVE" ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Activar</>}
        </button>
      </div>

      {sync.isSuccess && (
        <div style={{ background: "#052e1640", border: "1px solid #16a34a40", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#4ade80", fontSize: 13 }}>
          Datos sincronizados desde TikTok
        </div>
      )}
      {sync.isError && (
        <div style={{ background: "#2d1b0040", border: "1px solid #d9770640", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#fb923c", fontSize: 13 }}>
          Error al sincronizar: {(sync.error as Error)?.message}
        </div>
      )}

      {/* ── KPIs principales (8 tarjetas) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <MetricCard label="Impresiones" value={fmtInt(totalImpressions)} icon={<Eye size={18} />} color="#60a5fa"
          sub={hasData ? `${fmtInt(latest?.impressions)} ultima lectura` : "Esperando datos..."} />
        <MetricCard label="Clicks" value={fmtInt(totalClicks)} icon={<MousePointerClick size={18} />} color="#f59e0b"
          sub={hasData ? `CTR: ${avgCtr.toFixed(2)}%` : "Esperando datos..."} />
        <MetricCard label="Conversiones" value={fmtInt(totalConversions)} icon={<ShoppingCart size={18} />} color="#4ade80"
          sub={totalClicks > 0 ? `CVR: ${((totalConversions / totalClicks) * 100).toFixed(2)}%` : ""} />
        <MetricCard label="Gasto Total" value={fmt(totalSpend, "S/ ", "", 2)} icon={<DollarSign size={18} />} color="#f87171"
          sub={`de S/ ${budgetTotal.toFixed(0)} (${budgetPct.toFixed(1)}%)`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <MetricCard label="CTR" value={`${avgCtr.toFixed(2)}%`} icon={<Target size={18} />} color="#818cf8"
          sub={avgCtr > 1.8 ? "Arriba del promedio LATAM" : "Debajo del promedio (1.8%)"} trend={avgCtr > 1.8 ? "up" : avgCtr > 0 ? "down" : "neutral"} />
        <MetricCard label="CPC" value={fmt(avgCpc, "S/ ")} icon={<MousePointerClick size={18} />} color="#fb923c"
          sub="Costo por click" />
        <MetricCard label="CPM" value={fmt(avgCpm, "S/ ")} icon={<BarChart3 size={18} />} color="#a78bfa"
          sub="Costo por 1,000 impresiones" />
        <MetricCard label="ROAS" value={fmt(actualRoas || overallRoas, "", "x")} icon={<TrendingUp size={18} />}
          color={((actualRoas || overallRoas) ?? 0) >= 1 ? "#4ade80" : "#f87171"}
          sub={`Predicho: ${fmt(campaign.predicted_roas, "", "x")}`}
          trend={((actualRoas || overallRoas) ?? 0) >= 1 ? "up" : (actualRoas || overallRoas) ? "down" : "neutral"} />
      </div>

      {/* ── Progress bars ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", marginBottom: 14 }}>Presupuesto Gastado</div>
          <ProgressBar value={budgetUsed} max={budgetTotal} color="#f87171" label={`S/ ${budgetUsed.toFixed(2)} / S/ ${budgetTotal.toFixed(0)}`} />
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {budgetTotal - budgetUsed > 0 ? `Quedan S/ ${(budgetTotal - budgetUsed).toFixed(2)}` : "Presupuesto agotado"}
          </div>
        </div>
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", marginBottom: 14 }}>Embudo de Conversion</div>
          <ProgressBar value={totalClicks} max={totalImpressions} color="#f59e0b" label={`Impresiones → Clicks (${avgCtr.toFixed(2)}%)`} />
          <ProgressBar value={totalConversions} max={totalClicks || 1} color="#4ade80" label={`Clicks → Conversiones (${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0}%)`} />
        </div>
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", marginBottom: 14 }}>Auto-Optimize</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: campaign.auto_optimize ? "#4ade80" : "#6b7280" }} />
            <span style={{ fontSize: 14, color: "#f9fafb", fontWeight: 600 }}>{campaign.auto_optimize ? "Activo" : "Inactivo"}</span>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Pres. Diario: S/ {campaign.daily_budget_soles}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Pres. Total: S/ {budgetTotal}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            {campaign.auto_optimize ? "Pausa si CTR < 0.5% o ROAS < 1x | Escala si ROAS > 2.5x" : "Sin reglas automaticas"}
          </div>
        </div>
      </div>

      {/* ── Chart selector + Charts ── */}
      {hasData && (
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <SectionTitle icon={<BarChart3 size={18} />} title="Metricas en Tiempo Real" color="#60a5fa" />
            <div style={{ display: "flex", gap: 6 }}>
              {(["roas", "ctr", "spend", "funnel"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveChart(tab)}
                  style={{
                    background: activeChart === tab ? "#3b82f620" : "transparent",
                    border: `1px solid ${activeChart === tab ? "#3b82f6" : "#374151"}`,
                    color: activeChart === tab ? "#60a5fa" : "#6b7280",
                    borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                  {tab === "roas" ? "ROAS" : tab === "ctr" ? "CTR & Clicks" : tab === "spend" ? "Gasto" : "Embudo"}
                </button>
              ))}
            </div>
          </div>

          {activeChart === "roas" && (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff2d55" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }} />
                <ReferenceLine y={1} stroke="#f87171" strokeDasharray="4 4" label={{ value: "Break-even", fill: "#f87171", fontSize: 10 }} />
                <ReferenceLine y={2.5} stroke="#4ade80" strokeDasharray="4 4" label={{ value: "Escalar", fill: "#4ade80", fontSize: 10 }} />
                <Area type="monotone" dataKey="roas" stroke="#ff2d55" strokeWidth={2} fill="url(#roasGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChart === "ctr" && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#818cf8" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ctr" name="CTR %" stroke="#818cf8" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChart === "spend" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }}
                  formatter={(v) => [`S/ ${Number(v).toFixed(2)}`, ""]} />
                <Bar dataKey="spend" name="Gasto (S/)" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === "funnel" && funnelData.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie data={funnelData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#16161a", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#60a5fa" }}>{fmtInt(totalImpressions)}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Impresiones totales</div>
                </div>
                <div style={{ fontSize: 20, color: "#374151" }}>&#8595;</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{fmtInt(totalClicks)}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Clicks ({avgCtr.toFixed(2)}% CTR)</div>
                </div>
                <div style={{ fontSize: 20, color: "#374151" }}>&#8595;</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80" }}>{fmtInt(totalConversions)}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Conversiones</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── No data state ── */}
      {!hasData && !loadingAnalytics && (
        <div style={{
          background: "#16161a", border: "1px solid #1f2937", borderRadius: 14,
          padding: 40, textAlign: "center", marginBottom: 24,
        }}>
          <RefreshCw size={40} color="#374151" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#9ca3af", marginBottom: 8 }}>
            Sin datos de TikTok todavia
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            TikTok tarda 2-6 horas en reportar metricas. Presiona "Sync TikTok" para forzar una lectura.
          </div>
          <button onClick={handleSync} disabled={sync.isPending}
            style={{
              background: "#3b82f620", border: "1px solid #3b82f6", color: "#60a5fa",
              borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
            <RefreshCw size={14} style={{ marginRight: 8, display: "inline" }} />
            Sincronizar ahora
          </button>
        </div>
      )}

      {/* ── Bottom grid: Stats + Decisions + System flow ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Cost metrics */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <SectionTitle icon={<DollarSign size={18} />} title="Costos Detallados" color="#f59e0b" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "CPC (Costo/Click)", value: fmt(avgCpc, "S/ "), desc: "Lo que pagas por cada click" },
              { label: "CPM (Costo/1000 vistas)", value: fmt(avgCpm, "S/ "), desc: "Costo por mil impresiones" },
              { label: "CPA (Costo/Conversion)", value: totalConversions > 0 ? fmt(avgCpa, "S/ ") : "\u2014", desc: "Lo que pagas por cada venta" },
              { label: "Revenue Total", value: fmt(totalRevenue, "S/ "), desc: "Ingresos generados" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#0f0f10", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>{item.value}</span>
                </div>
                <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistical analysis */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <SectionTitle icon={<Brain size={18} />} title="Analisis AI & ML" color="#818cf8" />
          {stats?.bayesian_roas && (
            <div style={{ background: "#0f0f10", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>ROAS Bayesiano</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#60a5fa" }}>
                {stats.bayesian_roas.posterior_mean?.toFixed(2)}x
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                IC 95%: [{stats.bayesian_roas.credible_interval?.[0]?.toFixed(2)} \u2014 {stats.bayesian_roas.credible_interval?.[1]?.toFixed(2)}]
              </div>
              <div style={{ fontSize: 11, color: (stats.bayesian_roas.probability_profitable ?? 0) >= 0.6 ? "#4ade80" : "#fb923c", marginTop: 2 }}>
                P(rentable): {((stats.bayesian_roas.probability_profitable ?? 0) * 100).toFixed(0)}%
              </div>
            </div>
          )}
          {stats?.trend && (
            <div style={{ background: "#0f0f10", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Tendencia</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: stats.trend.trend_direction === "up" ? "#4ade80" : stats.trend.trend_direction === "down" ? "#f87171" : "#9ca3af" }}>
                {stats.trend.trend_direction === "up" ? "Subiendo" : stats.trend.trend_direction === "down" ? "Bajando" : "Estable"}
              </span>
            </div>
          )}
          {!stats && (
            <div style={{ fontSize: 13, color: "#6b7280" }}>Se activara cuando haya datos suficientes</div>
          )}
          <div style={{ background: "#0f0f10", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>ROAS Predicho vs Real</div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{fmt(campaign.predicted_roas, "", "x")}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>ML Prediccion</div>
              </div>
              <div style={{ fontSize: 18, color: "#374151" }}>&rarr;</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: actualRoas && actualRoas >= 1 ? "#4ade80" : "#f87171" }}>
                  {fmt(actualRoas, "", "x")}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Real TikTok</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decisions log */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 20 }}>
          <SectionTitle icon={<Zap size={18} />} title="Decisiones Automaticas" color="#4ade80" />
          {decisions.length === 0 ? (
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              <p>Sin decisiones aun. El sistema tomara acciones cuando:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "#f87171", background: "#f8717110", borderRadius: 6, padding: "6px 10px" }}>
                  PAUSAR si CTR &lt; 0.5% o ROAS &lt; 1.0x
                </div>
                <div style={{ fontSize: 11, color: "#4ade80", background: "#4ade8010", borderRadius: 6, padding: "6px 10px" }}>
                  ESCALAR si ROAS &gt; 2.5x (+30% presupuesto)
                </div>
                <div style={{ fontSize: 11, color: "#60a5fa", background: "#60a5fa10", borderRadius: 6, padding: "6px 10px" }}>
                  ANALIZAR GPT-4o cada 4h si gasto &gt; S/30
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {decisions.slice(0, 8).map((d) => (
                <div key={d.id} style={{
                  background: "#0f0f10", borderRadius: 8, padding: "10px 14px",
                  borderLeft: `3px solid ${d.decision_type === "PAUSE" ? "#f87171" : d.decision_type === "SCALE" ? "#4ade80" : "#60a5fa"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.decision_type === "PAUSE" ? "#f87171" : d.decision_type === "SCALE" ? "#4ade80" : "#60a5fa" }}>
                      {d.decision_type}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{new Date(d.created_at).toLocaleDateString("es-PE")}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{d.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── System flow diagram ── */}
      <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
        <SectionTitle icon={<Activity size={18} />} title="Como Funciona el Sistema" color="#ff2d55" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "TikTok Ads", sub: "Datos cada 1h", color: "#ff2d55", active: true },
            { label: "\u2192", sub: "", color: "#374151", active: false },
            { label: "Sync Metricas", sub: "Impresiones, clicks, CPC...", color: "#60a5fa", active: hasData },
            { label: "\u2192", sub: "", color: "#374151", active: false },
            { label: "SQLite DB", sub: `${metrics.length} registros`, color: "#a78bfa", active: hasData },
            { label: "\u2192", sub: "", color: "#374151", active: false },
            { label: "ML + Stats", sub: "Bayesian, ROAS predict", color: "#818cf8", active: !!stats },
            { label: "\u2192", sub: "", color: "#374151", active: false },
            { label: "GPT-4o", sub: "Analisis cada 4h", color: "#4ade80", active: decisions.length > 0 },
            { label: "\u2192", sub: "", color: "#374151", active: false },
            { label: "Auto-Decide", sub: "Pausar / Escalar", color: "#f59e0b", active: decisions.length > 0 },
          ].map((step, i) => (
            step.label === "\u2192" ? (
              <span key={i} style={{ fontSize: 20, color: "#374151" }}>&rarr;</span>
            ) : (
              <div key={i} style={{
                background: step.active ? `${step.color}15` : "#0f0f10",
                border: `1px solid ${step.active ? `${step.color}40` : "#1f2937"}`,
                borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 100,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: step.active ? step.color : "#6b7280" }}>{step.label}</div>
                {step.sub && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{step.sub}</div>}
              </div>
            )
          ))}
        </div>
      </div>

      {loadingAnalytics && (
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 16, textAlign: "center" }}>Cargando analytics...</p>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
