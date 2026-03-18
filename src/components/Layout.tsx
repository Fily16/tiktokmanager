import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  BarChart2,
  Settings,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { useConfigStatus } from "../api/hooks";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Megaphone, label: "Campañas" },
  { to: "/campaign/new", icon: PlusCircle, label: "Nueva Campaña" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Configuración" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { data: config } = useConfigStatus();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f10" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: open ? 220 : 64,
          minHeight: "100vh",
          background: "#16161a",
          borderRight: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          flexShrink: 0,
        }}
      >
        {/* Logo / Toggle */}
        <div
          style={{
            padding: "16px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid #1f2937",
            cursor: "pointer",
          }}
          onClick={() => setOpen(!open)}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={18} color="#fff" />
          </div>
          {open && (
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f9fafb", whiteSpace: "nowrap" }}>
              TikTok Manager
            </span>
          )}
          <div style={{ marginLeft: "auto" }}>
            {open ? <X size={16} color="#6b7280" /> : <Menu size={16} color="#6b7280" />}
          </div>
        </div>

        {/* Status pill */}
        {open && (
          <div style={{ padding: "8px 12px" }}>
            <div
              style={{
                background: config?.is_ready ? "#052e1620" : "#2d1b0020",
                border: `1px solid ${config?.is_ready ? "#16a34a40" : "#d9770640"}`,
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 11,
                color: config?.is_ready ? "#4ade80" : "#fb923c",
              }}
            >
              {config?.is_ready ? "● Sistema listo" : "● Config pendiente"}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                margin: "2px 8px",
                borderRadius: 8,
                textDecoration: "none",
                color: isActive ? "#f9fafb" : "#9ca3af",
                background: isActive ? "#ff2d5515" : "transparent",
                borderLeft: isActive ? "2px solid #ff2d55" : "2px solid transparent",
                transition: "all 0.15s",
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {open && (
                <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
