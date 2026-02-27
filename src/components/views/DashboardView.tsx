"use client";

import { useState, useEffect, useRef } from "react";
import type { BusinessConfig, Reservation } from "@/lib/types";
import {
  formatDateTime,
  STATUS_CONFIG,
  CHANNEL_LABELS,
  BUSINESS_LABELS,
} from "@/lib/store";
import { startPolling } from "@/lib/realtime";
import type { RealtimeStats } from "@/lib/realtime";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
  onNewReservation: () => void;
  onNavigate: (view: "dashboard" | "reservations" | "calendar" | "ai" | "settings") => void;
}

export default function DashboardView({ config, reservations, onNewReservation, onNavigate }: Props) {
  const now = new Date();
  const today = now.toDateString();

  const todayRes = reservations.filter(
    (r) => new Date(r.dateTime).toDateString() === today
  );
  const pending = reservations.filter((r) => r.status === "in_attesa");
  const confirmed = reservations.filter((r) => r.status === "confermata");
  const aiHandledLocal = reservations.filter((r) => r.aiHandled);

  // ── Real-time AI counter ──────────────────────────────────────────────────
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [isLive, setIsLive] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const businessId =
    process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID ?? "twilight-lake-0344";

  useEffect(() => {
    // Start polling /api/stats for live AI counter
    const stop = startPolling(businessId, (stats) => {
      setRealtimeStats(stats);
      setIsLive(true);
    });
    stopPollingRef.current = stop;

    return () => {
      stop();
    };
  }, [businessId]);

  // Use server-side count if available, otherwise fall back to localStorage count
  const aiHandledCount = realtimeStats?.aiHandledCount ?? aiHandledLocal.length;

  // Upcoming (next 7 days)
  const upcoming = reservations
    .filter((r) => {
      const d = new Date(r.dateTime);
      return d >= now && r.status !== "cancellata" && r.status !== "completata";
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  // Channel breakdown
  const channelCounts: Record<string, number> = {};
  reservations.forEach((r) => {
    channelCounts[r.channel] = (channelCounts[r.channel] || 0) + 1;
  });

  const businessInfo = BUSINESS_LABELS[config.businessType];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
            {new Date().toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 6 }}>
            Benvenuto, {config.businessName || "Admin"} {businessInfo.icon}
          </h2>
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            {todayRes.length === 0
              ? "Nessuna prenotazione per oggi"
              : `${todayRes.length} prenotazion${todayRes.length === 1 ? "e" : "i"} oggi`}
            {pending.length > 0 && ` · ${pending.length} in attesa di conferma`}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {/* Live indicator */}
          {isLive && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontSize: 11,
                color: "white",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              LIVE · {businessId}
            </div>
          )}
          <button
            className="btn"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onNewReservation}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuova Prenotazione
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "Oggi",
            value: todayRes.length,
            icon: "📅",
            color: "var(--primary)",
            bg: "var(--primary-muted)",
          },
          {
            label: "In Attesa",
            value: pending.length,
            icon: "⏳",
            color: "var(--warning)",
            bg: "var(--warning-bg)",
          },
          {
            label: "Confermate",
            value: confirmed.length,
            icon: "✅",
            color: "var(--success)",
            bg: "var(--success-bg)",
          },
          {
            label: "Gestite da AI",
            value: aiHandledCount,
            icon: "🤖",
            color: "#667eea",
            bg: "rgba(102,126,234,0.1)",
            live: isLive,
          },
          ...(config.businessType === "ristorante"
            ? [
                {
                  label: "Coperti Oggi",
                  value: todayRes.reduce((sum, r) => sum + (r.covers || 0), 0),
                  icon: "🍽️",
                  color: "var(--restaurant)",
                  bg: "var(--restaurant-bg)",
                },
              ]
            : []),
        ].map((stat) => (
          <div key={stat.label} className="stat-card" style={{ position: "relative" }}>
            {"live" in stat && stat.live && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4ade80",
                  animation: "pulse 2s infinite",
                }}
                title="Aggiornamento in tempo reale"
              />
            )}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: stat.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                marginBottom: 4,
              }}
            >
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Upcoming reservations */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
              Prossime prenotazioni
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate("reservations")}
              style={{ fontSize: 12 }}
            >
              Vedi tutte →
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
              <p style={{ fontSize: 14 }}>Nessuna prenotazione in arrivo</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((r) => {
                const { date, time, relative } = formatDateTime(r.dateTime);
                const statusConf = STATUS_CONFIG[r.status];
                const channelConf = CHANNEL_LABELS[r.channel];
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "var(--surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {channelConf?.icon || "📅"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.clientName}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {r.service} · {time}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span className={`badge ${statusConf.badgeClass}`} style={{ fontSize: 11 }}>
                        {statusConf.label}
                      </span>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                        {relative}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Channel breakdown */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
            Prenotazioni per canale
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(channelCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([channel, count]) => {
                const conf = CHANNEL_LABELS[channel];
                const pct = Math.round((count / reservations.length) * 100);
                return (
                  <div key={channel}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                        {conf?.icon} {conf?.label || channel}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 99,
                        background: "var(--surface-2)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 99,
                          background: "var(--primary)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* AI summary */}
          {config.aiEnabled && (
            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 10,
                background: "rgba(102,126,234,0.08)",
                border: "1px solid rgba(102,126,234,0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#667eea" }}>
                  🤖 Assistente AI
                </p>
                {isLive && (
                  <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, letterSpacing: "0.05em" }}>
                    ● LIVE
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Ha gestito{" "}
                <strong style={{ color: "#667eea" }}>{aiHandledCount}</strong> prenotazioni
                automaticamente ({Math.round((aiHandledCount / Math.max(reservations.length, 1)) * 100)}% del totale)
              </p>
              {realtimeStats && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Ultimo aggiornamento: {new Date(realtimeStats.lastUpdatedAt).toLocaleTimeString("it-IT")}
                </p>
              )}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate("ai")}
                style={{ marginTop: 8, fontSize: 12, color: "#667eea", padding: "4px 0" }}
              >
                Vedi attività AI →
              </button>
            </div>
          )}

          {/* Integration status */}
          {realtimeStats && (
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { key: "gemini", label: "Gemini", icon: "🧠" },
                { key: "sendgrid", label: "Email", icon: "✉️" },
                { key: "whatsapp", label: "WhatsApp", icon: "📱" },
                { key: "twilio", label: "Twilio", icon: "📞" },
                { key: "elevenLabs", label: "Voice", icon: "🎙️" },
              ].map(({ key, label, icon }) => {
                const active = realtimeStats.integrations[key as keyof typeof realtimeStats.integrations];
                return (
                  <span
                    key={key}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: active ? "rgba(34,197,94,0.1)" : "var(--surface-2)",
                      color: active ? "#16a34a" : "var(--text-muted)",
                      border: `1px solid ${active ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                    }}
                    title={active ? `${label} configurato` : `${label} non configurato`}
                  >
                    {icon} {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending reservations alert */}
      {pending.length > 0 && (
        <div
          className="notification notification-warning"
          style={{ borderRadius: 12, padding: "16px 20px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>
              {pending.length} prenotazion{pending.length === 1 ? "e" : "i"} in attesa di conferma
            </p>
            <p style={{ fontSize: 13, opacity: 0.85 }}>
              Controlla e conferma le prenotazioni ricevute via email, SMS o telefono.
            </p>
            <button
              className="btn btn-sm"
              style={{
                marginTop: 8,
                background: "var(--warning)",
                color: "white",
                border: "none",
              }}
              onClick={() => onNavigate("reservations")}
            >
              Gestisci ora →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
