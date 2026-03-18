import React, { useState } from "react";
import { useConfigStatus, useSaveConfig } from "../api/hooks";
import { CheckCircle, AlertCircle, Eye, EyeOff, Save } from "lucide-react";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  secret = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  secret?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, color: "#9ca3af", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={secret && !show ? "password" : "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "#0f0f10",
            border: "1px solid #374151",
            borderRadius: 8,
            padding: "10px 40px 10px 14px",
            color: "#f9fafb",
            fontSize: 14,
            outline: "none",
          }}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: 0,
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const { data: config, isLoading } = useConfigStatus();
  const save = useSaveConfig();

  const [form, setForm] = useState({
    openai_api_key: "",
    tiktok_app_id: "",
    tiktok_app_secret: "",
    tiktok_access_token: "",
    tiktok_advertiser_id: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v.trim() !== "")
    );
    if (Object.keys(filtered).length === 0) return;
    save.mutate(filtered);
  };

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>
        Configuración
      </h1>
      <p style={{ margin: "0 0 32px", color: "#6b7280", fontSize: 14 }}>
        Ingresa tus API keys. Se guardan cifradas en la base de datos local.
      </p>

      {/* Status cards */}
      {!isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <div
            style={{
              background: "#16161a",
              border: `1px solid ${config?.has_openai ? "#16a34a40" : "#374151"}`,
              borderRadius: 10,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {config?.has_openai ? (
              <CheckCircle size={18} color="#4ade80" />
            ) : (
              <AlertCircle size={18} color="#6b7280" />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>OpenAI</div>
              <div style={{ fontSize: 11, color: config?.has_openai ? "#4ade80" : "#6b7280" }}>
                {config?.has_openai ? "Configurado" : "Sin configurar"}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#16161a",
              border: `1px solid ${config?.has_tiktok ? "#16a34a40" : "#374151"}`,
              borderRadius: 10,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {config?.has_tiktok ? (
              <CheckCircle size={18} color="#4ade80" />
            ) : (
              <AlertCircle size={18} color="#6b7280" />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>TikTok Ads</div>
              <div style={{ fontSize: 11, color: config?.has_tiktok ? "#4ade80" : "#6b7280" }}>
                {config?.has_tiktok
                  ? `Advertiser: ${config.advertiser_id?.slice(0, 8)}...`
                  : "Sin configurar"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit}>
        <div
          style={{
            background: "#16161a",
            border: "1px solid #1f2937",
            borderRadius: 12,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            OpenAI
          </h3>
          <Field
            label="OpenAI API Key"
            name="openai_api_key"
            value={form.openai_api_key}
            onChange={onChange}
            placeholder="sk-..."
            secret
          />
        </div>

        <div
          style={{
            background: "#16161a",
            border: "1px solid #1f2937",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>
            TikTok Ads API
          </h3>
          <Field label="App ID" name="tiktok_app_id" value={form.tiktok_app_id} onChange={onChange} placeholder="1234567890" />
          <Field label="App Secret" name="tiktok_app_secret" value={form.tiktok_app_secret} onChange={onChange} placeholder="abc123..." secret />
          <Field label="Access Token" name="tiktok_access_token" value={form.tiktok_access_token} onChange={onChange} placeholder="att_..." secret />
          <Field label="Advertiser ID" name="tiktok_advertiser_id" value={form.tiktok_advertiser_id} onChange={onChange} placeholder="6900000000000" />
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: save.isPending ? "#374151" : "linear-gradient(135deg,#ff2d55,#ff6b35)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: save.isPending ? "not-allowed" : "pointer",
          }}
        >
          <Save size={16} />
          {save.isPending ? "Guardando..." : "Guardar Configuración"}
        </button>

        {save.isSuccess && (
          <div style={{ marginTop: 12, color: "#4ade80", fontSize: 14, display: "flex", gap: 6, alignItems: "center" }}>
            <CheckCircle size={16} /> Configuración guardada correctamente
          </div>
        )}
        {save.isError && (
          <div style={{ marginTop: 12, color: "#f87171", fontSize: 14 }}>
            Error: {save.error?.message}
          </div>
        )}
      </form>
    </div>
  );
}
