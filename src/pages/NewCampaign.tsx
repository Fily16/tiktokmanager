import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoPublish, useAnalyzeImages } from "../api/hooks";
import type { AutoPublishRequest, AutoPublishResponse, ImageAnalysisResponse } from "../api/types";
import {
  Rocket, Brain, TrendingUp, CheckCircle, AlertTriangle, ChevronRight,
  Upload, Image, Star, Target, Users, Hash, Sparkles, Eye, X,
} from "lucide-react";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13, color: "#9ca3af", marginBottom: 6, fontWeight: 500 }}>
      {children}
    </label>
  );
}

function Input({
  label, name, value, onChange, placeholder, type = "text", min, step,
}: {
  label: string; name: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string; type?: string; min?: number; step?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#0f0f10",
          border: "1px solid #374151",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#f9fafb",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function Textarea({
  label, name, value, onChange, placeholder, rows = 4,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          background: "#0f0f10",
          border: "1px solid #374151",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#f9fafb",
          fontSize: 14,
          outline: "none",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? "#4ade80" : pct >= 50 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
        <span>{label}</span><span style={{ color }}>{score}/{max}</span>
      </div>
      <div style={{ background: "#1f2937", borderRadius: 4, height: 6 }}>
        <div style={{ background: color, borderRadius: 4, height: 6, width: `${pct}%`, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function ImageAnalysisCard({ analysis }: { analysis: ImageAnalysisResponse }) {
  const ia = analysis.image_analysis.image_analysis;
  const audience = analysis.image_analysis.audience_from_visual;
  const copies = analysis.image_analysis.copy_suggestions;
  const strategy = analysis.image_analysis.campaign_strategy;
  const score = analysis.image_analysis.ad_score;

  return (
    <div style={{ background: "#16161a", border: "1px solid #4f46e540", borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Sparkles size={22} color="#a78bfa" />
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#f9fafb" }}>
          Análisis IA de tu Pieza Publicitaria
        </h3>
      </div>

      {/* Puntuación general */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "General", value: score.overall, icon: Star },
          { label: "Atención", value: score.attention_grabbing, icon: Eye },
          { label: "Claridad", value: score.message_clarity, icon: Target },
          { label: "CTA", value: score.call_to_action_strength, icon: Rocket },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: "#0f0f10", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <Icon size={16} color="#a78bfa" style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: value >= 7 ? "#4ade80" : value >= 5 ? "#f59e0b" : "#f87171" }}>{value}/10</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Productos y precios detectados */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Productos detectados</div>
          {ia.products_detected.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#f9fafb", padding: "2px 0" }}>- {p}</div>
          ))}
        </div>
        <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Precios detectados</div>
          {ia.prices_detected.length > 0 ? ia.prices_detected.map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: "#4ade80", padding: "2px 0" }}>S/ {p}</div>
          )) : <div style={{ fontSize: 13, color: "#6b7280" }}>No se detectaron precios</div>}
        </div>
      </div>

      {/* Calidad visual */}
      <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8 }}>Calidad Visual</span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
            background: ia.is_suitable_for_tiktok ? "#16a34a20" : "#dc262620",
            color: ia.is_suitable_for_tiktok ? "#4ade80" : "#f87171"
          }}>
            {ia.is_suitable_for_tiktok ? "Apta para TikTok" : "Necesita mejoras"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#d1d5db", lineHeight: 1.5 }}>{ia.visual_quality_notes}</p>
        {ia.improvement_suggestions.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4 }}>Mejoras sugeridas:</div>
            {ia.improvement_suggestions.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: "#9ca3af", padding: "2px 0" }}>- {s}</div>
            ))}
          </div>
        )}
      </div>

      {/* Audiencia sugerida */}
      <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Users size={14} color="#60a5fa" />
          <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8 }}>Audiencia Ideal (basada en imagen)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#d1d5db" }}>
          <div><span style={{ color: "#6b7280" }}>Edad:</span> {audience.ideal_age_range[0]}-{audience.ideal_age_range[1]}</div>
          <div><span style={{ color: "#6b7280" }}>Género:</span> {audience.ideal_gender}</div>
          <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Persona:</span> {audience.buyer_persona}</div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#6b7280" }}>Intereses:</span>{" "}
            {audience.interests.map((int, i) => (
              <span key={i} style={{ background: "#1e1b4b", color: "#a78bfa", padding: "2px 8px", borderRadius: 12, fontSize: 11, marginRight: 4, display: "inline-block", marginBottom: 4 }}>{int}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Copies sugeridos */}
      <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Hooks sugeridos (cortos para TikTok)</div>
        {copies.hooks.map((h, i) => (
          <div key={i} style={{ fontSize: 14, color: "#f9fafb", padding: "6px 0", borderBottom: i < copies.hooks.length - 1 ? "1px solid #1f2937" : "none" }}>
            "{h}"
          </div>
        ))}
      </div>

      {/* Hashtags */}
      <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Hash size={14} color="#f59e0b" />
          <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8 }}>Hashtags recomendados</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {copies.hashtags.map((tag, i) => (
            <span key={i} style={{ background: "#1c1917", color: "#f59e0b", padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 500 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Estrategia */}
      <div style={{ background: "#0f0f10", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Target size={14} color="#4ade80" />
          <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8 }}>Estrategia recomendada</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "#d1d5db" }}>
          <div><span style={{ color: "#6b7280" }}>Objetivo:</span> {strategy.recommended_objective}</div>
          <div><span style={{ color: "#6b7280" }}>Formato:</span> {strategy.content_format}</div>
          <div><span style={{ color: "#6b7280" }}>Ubicación:</span> {strategy.best_placement}</div>
          <div><span style={{ color: "#6b7280" }}>Emoción:</span> {copies.emotion_to_trigger}</div>
          <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Punto de venta clave:</span> {strategy.key_selling_point}</div>
          {strategy.urgency_angle && (
            <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#f59e0b" }}>Urgencia:</span> {strategy.urgency_angle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: AutoPublishResponse }) {
  const navigate = useNavigate();
  const isPublished = result.status === "published";
  const ds = result.data_science_decisions;
  const bayesian = ds?.bayesian_analysis;
  const ml = ds?.ml_prediction;
  const creative = ds?.creative_selection;
  const prob = ds?.probability_analysis;
  const budget = ds?.budget_distribution;
  const profitable = bayesian ? bayesian.prob_profitable >= 0.6 : false;

  return (
    <div
      style={{
        background: "#16161a",
        border: `1px solid ${isPublished ? "#16a34a40" : "#dc262640"}`,
        borderRadius: 16,
        padding: 28,
        marginTop: 32,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        {isPublished ? <CheckCircle size={28} color="#4ade80" /> : <AlertTriangle size={28} color="#f87171" />}
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f9fafb" }}>
            {isPublished ? "Campaña publicada en TikTok" : "Campaña bloqueada — protección activa"}
          </h3>
          {isPublished && result.tiktok_campaign_id && (
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
              ID TikTok: {result.tiktok_campaign_id} | {result.campaign_name}
            </p>
          )}
          {!isPublished && result.reason && (
            <p style={{ margin: "4px 0 0", color: "#f87171", fontSize: 13, lineHeight: 1.5 }}>{result.reason}</p>
          )}
        </div>
      </div>

      {/* KPIs principales (solo si se publicó) */}
      {isPublished && ds && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "ROAS Predicho (ML)", value: `${ml?.predicted_roas?.toFixed(2)}x`, color: "#60a5fa" },
            { label: "Prob. Rentable (Bayesian)", value: `${((bayesian?.prob_profitable ?? 0) * 100).toFixed(0)}%`, color: profitable ? "#4ade80" : "#fb923c" },
            { label: "Presupuesto Diario", value: `S/ ${budget?.daily_soles}`, color: "#f59e0b" },
            { label: "Prob. ≥1 Conversión (Poisson)", value: `${((prob?.prob_at_least_1_conversion ?? 0) * 100).toFixed(1)}%`, color: "#a78bfa" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#0f0f10", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Intervalo Bayesiano */}
      {bayesian && (
        <div style={{ background: "#0f0f1080", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Intervalo de confianza ROAS (95%): </span>
          <span style={{ color: "#f9fafb", fontWeight: 600 }}>
            [{bayesian.roas_ci_95[0].toFixed(2)}x — {bayesian.roas_ci_95[1].toFixed(2)}x]
          </span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 12 }}>μ = {bayesian.roas_mean.toFixed(2)}x</span>
        </div>
      )}

      {/* Copy ganador */}
      {creative && (
        <div style={{ background: "#0f0f1080", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Copy ganador — {creative.algorithm} ({creative.simulations_run.toLocaleString()} simulaciones)
          </div>
          <div style={{ color: "#f9fafb", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            "{creative.winner_hook}"
          </div>
          <div style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
            {creative.winner_headline}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9ca3af" }}>
            <span>Score: <strong style={{ color: "#60a5fa" }}>{creative.winner_score}/100</strong> ({creative.winner_grade})</span>
            <span>Prob. ganar: <strong style={{ color: "#4ade80" }}>{(creative.winner_probability * 100).toFixed(0)}%</strong></span>
          </div>
        </div>
      )}

      {/* Distribución de presupuesto */}
      {budget && (
        <div style={{ background: "#0f0f1080", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Distribución de presupuesto (Optimizador ML)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 13, color: "#d1d5db" }}>
            <div>S/{budget.daily_soles}/día</div>
            <div>{budget.duration_days} días</div>
            <div>Estrategia: {budget.strategy}</div>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>{budget.rationale}</p>
        </div>
      )}

      {/* Pipeline ejecutado */}
      {result.publish_log && result.publish_log.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Pipeline ejecutado
          </div>
          {result.publish_log.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13, color: "#9ca3af" }}>
              <ChevronRight size={14} color={isPublished ? "#4ade80" : "#f59e0b"} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Monitoreo */}
      {isPublished && result.monitoring && (
        <div style={{ background: "#0f0f1080", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Monitoreo automático activo
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#9ca3af" }}>
            <div>Revisión: {result.monitoring.check_every}</div>
            <div>Auto-optimización: {result.monitoring.auto_optimize ? "Sí" : "No"}</div>
            <div>Pausa si: {result.monitoring.auto_pause_if}</div>
            <div>Escalar si: {result.monitoring.auto_scale_if}</div>
          </div>
        </div>
      )}

      {/* Sugerencias AI (cuando está bloqueada) */}
      {!isPublished && result.ai_suggestions && result.ai_suggestions.length > 0 && (
        <div style={{ background: "#1e1b4b20", border: "1px solid #4f46e540", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#a5b4fc", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Sugerencias IA para mejorar
          </div>
          {result.ai_suggestions.map((sug, i) => (
            <div key={i} style={{ fontSize: 13, color: "#c4b5fd", padding: "3px 0" }}>• {sug}</div>
          ))}
        </div>
      )}

      {/* Botón a detalle */}
      {isPublished && result.campaign_id && (
        <button
          onClick={() => navigate(`/campaign/${result.campaign_id}`)}
          style={{
            background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ver detalles de campaña
        </button>
      )}
    </div>
  );
}

export default function NewCampaign() {
  const publish = useAutoPublish();
  const analyzeImages = useAnalyzeImages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResponse | null>(null);

  const [form, setForm] = useState({
    product_description: "",
    budget_total_soles: 50,
    landing_url: "",
    objective: "CONVERSIONS" as AutoPublishRequest["objective"],
    target_roas: 2.0,
    min_viability_roas: 1.5,
    auto_optimize: true,
    // Campos solo para UI (no se envían al backend)
    _product_name: "",
    _target_price_soles: 0,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setImageAnalysis(null);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((f) => f.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) setImageAnalysis(null);
  };

  const onAnalyzeImages = () => {
    if (selectedFiles.length === 0) return;
    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append("images", f));
    formData.append("product_context", form.product_description || "Venta de perfumes arabes al por mayor y menor en Peru");

    analyzeImages.mutate(formData, {
      onSuccess: (data) => {
        setImageAnalysis(data);
        // Auto-rellenar descripción si está vacía
        if (!form.product_description && data.image_analysis) {
          const ia = data.image_analysis.image_analysis;
          const autoDesc = `${ia.products_detected.join(", ")}. ${data.image_analysis.campaign_strategy.key_selling_point}`;
          setForm((f) => ({ ...f, product_description: autoDesc }));
        }
      },
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construir descripción enriquecida con contexto visual + nombre + precio
    let description = form.product_description;
    if (form._product_name) {
      description = `${form._product_name}. ${description}`;
    }
    if (form._target_price_soles > 0) {
      description += ` Precio: S/${form._target_price_soles}.`;
    }

    // Enriquecer con análisis de imagen si existe
    if (imageAnalysis) {
      const ia = imageAnalysis.image_analysis;
      description += `
[ANÁLISIS VISUAL IA]: Productos: ${ia.image_analysis.products_detected.join(", ")}.
Precios: ${ia.image_analysis.prices_detected.join(", ")}.
Marcas: ${ia.image_analysis.brands_detected.join(", ")}.
Punto de venta: ${ia.campaign_strategy.key_selling_point}.
Audiencia ideal: ${ia.audience_from_visual.buyer_persona}.
Emoción a activar: ${ia.copy_suggestions.emotion_to_trigger}.
Hashtags: ${ia.copy_suggestions.hashtags.join(" ")}.`;
    }

    // Enviar solo los campos que el backend espera
    const payload: AutoPublishRequest = {
      product_description: description.trim(),
      budget_total_soles: form.budget_total_soles,
      landing_url: form.landing_url,
      objective: form.objective,
      target_roas: form.target_roas,
      min_viability_roas: form.min_viability_roas,
      auto_optimize: form.auto_optimize,
    };
    publish.mutate(payload);
  };

  return (
    <div style={{ padding: 32, maxWidth: 780 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Rocket size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>
            Nueva Campaña Auto-Publish
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
            Sube tus piezas + IA analiza + Data Science + Publica en TikTok
          </p>
        </div>
      </div>

      {/* AI info banner */}
      <div
        style={{
          background: "#1e1b4b20", border: "1px solid #4f46e540",
          borderRadius: 10, padding: "12px 18px", marginBottom: 28, marginTop: 20,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}
      >
        <Brain size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: "#a5b4fc", lineHeight: 1.6 }}>
          <strong>Pipeline:</strong> Sube fotos → GPT-4o Vision analiza imagen → detecta productos, precios, audiencia →
          Gradient Boosting predice ROAS → Bayesian valida → Thompson Sampling elige copy → Publica en TikTok.
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* SECCIÓN 1: Piezas Publicitarias */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Image size={18} color="#a78bfa" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
              Piezas Publicitarias
            </h3>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #374151", borderRadius: 12, padding: previews.length > 0 ? 16 : 40,
              textAlign: "center", cursor: "pointer", marginBottom: 16,
              background: "#0f0f10", transition: "border-color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#374151")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesSelected}
              style={{ display: "none" }}
            />

            {previews.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`preview-${i}`}
                      style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        background: "#ef4444", border: "none", borderRadius: "50%",
                        width: 22, height: 22, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", padding: 0,
                      }}
                    >
                      <X size={12} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Upload size={32} color="#6b7280" style={{ marginBottom: 8 }} />
                <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 4 }}>
                  Click para subir tus fotos de producto / piezas
                </div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>
                  Hasta 5 imágenes (JPG, PNG). GPT-4o las analizará automáticamente.
                </div>
              </>
            )}
          </div>

          {/* Analyze button */}
          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={onAnalyzeImages}
              disabled={analyzeImages.isPending}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "12px 20px", borderRadius: 10,
                background: analyzeImages.isPending ? "#374151" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                color: "#fff", border: "none", fontSize: 14, fontWeight: 600,
                cursor: analyzeImages.isPending ? "not-allowed" : "pointer",
              }}
            >
              {analyzeImages.isPending ? (
                <><Sparkles size={16} /> GPT-4o Vision analizando imágenes...</>
              ) : (
                <><Sparkles size={16} /> Analizar con IA ({selectedFiles.length} {selectedFiles.length === 1 ? "imagen" : "imágenes"})</>
              )}
            </button>
          )}

          {analyzeImages.isError && (
            <div style={{ background: "#1f0a0a", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <AlertTriangle size={14} color="#f87171" />
              <span style={{ color: "#f87171", fontSize: 13 }}>{analyzeImages.error?.message}</span>
            </div>
          )}
        </div>

        {/* Resultado del análisis de imagen */}
        {imageAnalysis && <ImageAnalysisCard analysis={imageAnalysis} />}

        {/* SECCIÓN 2: Producto */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            Producto
          </h3>
          <Input
            label="Nombre del producto"
            name="_product_name"
            value={form._product_name}
            onChange={onChange}
            placeholder="Ej: Consolidado Perfumes Árabes - Marzo 2026"
          />
          <Textarea
            label="Descripción detallada (la IA lo completa si analizas imágenes)"
            name="product_description"
            value={form.product_description}
            onChange={onChange}
            placeholder="Describe el producto: características, beneficios, público objetivo... O sube fotos y la IA lo analiza por ti."
            rows={4}
          />
          <Input
            label="Precio de venta (S/)"
            name="_target_price_soles"
            type="number"
            value={form._target_price_soles}
            onChange={onChange}
            placeholder="89.90"
            min={1}
            step={0.01}
          />
          <Input
            label="URL de destino (web o WhatsApp)"
            name="landing_url"
            value={form.landing_url}
            onChange={onChange}
            placeholder="https://aromastudiope.com o https://wa.me/51903250695"
          />
          <div style={{ marginBottom: 20 }}>
            <Label>Objetivo de campaña</Label>
            <select
              name="objective"
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value as AutoPublishRequest["objective"] }))}
              style={{
                width: "100%",
                background: "#0f0f10",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f9fafb",
                fontSize: 14,
                outline: "none",
              }}
            >
              <option value="CONVERSIONS">Conversiones (ventas)</option>
              <option value="TRAFFIC">Tráfico (visitas a web)</option>
              <option value="VIDEO_VIEWS">Visualizaciones de video</option>
              <option value="REACH">Alcance (máximas personas)</option>
              <option value="LEAD_GENERATION">Generación de leads</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN 3: Presupuesto */}
        <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            Presupuesto y Optimización
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input
              label="Presupuesto total (S/)"
              name="budget_total_soles"
              type="number"
              value={form.budget_total_soles}
              onChange={onChange}
              placeholder="50"
              min={20}
              step={1}
            />
            <Input
              label="ROAS objetivo"
              name="target_roas"
              type="number"
              value={form.target_roas}
              onChange={onChange}
              placeholder="2.0"
              min={0.5}
              step={0.1}
            />
          </div>
          <Input
            label="ROAS mínimo de viabilidad"
            name="min_viability_roas"
            type="number"
            value={form.min_viability_roas ?? 1.5}
            onChange={onChange}
            placeholder="1.5"
            min={0.5}
            step={0.1}
          />
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Si el ML predice ROAS menor a este valor, la campaña será bloqueada para proteger tu presupuesto.
            El optimizador calculará automáticamente la distribución diaria y duración óptima.
          </p>
        </div>

        {/* Preview del anuncio */}
        {imageAnalysis && (
          <div style={{ background: "#16161a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Eye size={18} color="#60a5fa" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
                Preview del Anuncio
              </h3>
            </div>
            <div style={{ background: "#0f0f10", borderRadius: 12, padding: 16, maxWidth: 340, margin: "0 auto" }}>
              {/* Simula un post de TikTok */}
              {previews[0] && (
                <img src={previews[0]} alt="ad-preview" style={{ width: "100%", borderRadius: 8, marginBottom: 12 }} />
              )}
              <div style={{ fontSize: 14, color: "#f9fafb", fontWeight: 600, marginBottom: 6 }}>
                {imageAnalysis.image_analysis.copy_suggestions.hooks[0] || "Hook del anuncio"}
              </div>
              <div style={{ fontSize: 13, color: "#d1d5db", marginBottom: 10, lineHeight: 1.4 }}>
                {imageAnalysis.image_analysis.copy_suggestions.descriptions[0] || "Descripción del anuncio"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {imageAnalysis.image_analysis.copy_suggestions.hashtags.slice(0, 4).map((tag, i) => (
                  <span key={i} style={{ color: "#60a5fa", fontSize: 12 }}>{tag}</span>
                ))}
              </div>
              <div style={{
                background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
                color: "#fff", textAlign: "center", padding: "8px 16px",
                borderRadius: 8, fontSize: 13, fontWeight: 600,
              }}>
                {imageAnalysis.image_analysis.copy_suggestions.cta_recommendation === "SHOP_NOW" ? "Comprar Ahora" :
                  imageAnalysis.image_analysis.copy_suggestions.cta_recommendation === "CONTACT_US" ? "Contactar" :
                    imageAnalysis.image_analysis.copy_suggestions.cta_recommendation === "MESSAGE" ? "Enviar Mensaje" : "Ver Más"}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {publish.isError && (
          <div style={{ background: "#1f0a0a", border: "1px solid #ef444440", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ color: "#f87171", fontSize: 13 }}>{publish.error?.message}</div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={publish.isPending}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%",
            background: publish.isPending ? "#374151" : "linear-gradient(135deg,#ff2d55,#ff6b35)",
            color: "#fff", border: "none", borderRadius: 12, padding: "16px 24px",
            fontSize: 16, fontWeight: 700,
            cursor: publish.isPending ? "not-allowed" : "pointer",
          }}
        >
          {publish.isPending ? (
            <><TrendingUp size={20} /> Analizando con IA y publicando...</>
          ) : (
            <><Rocket size={20} /> Auto-Publicar Campaña</>
          )}
        </button>

        {publish.isPending && (
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginTop: 12 }}>
            {imageAnalysis ? "Usando análisis visual + " : ""}GPT-4o analizando → ML prediciendo ROAS → Validación Bayesiana → Publicando en TikTok...
          </p>
        )}
      </form>

      {publish.isSuccess && publish.data && <ResultCard result={publish.data} />}
    </div>
  );
}
