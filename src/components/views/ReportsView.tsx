"use client";

import { useState } from "react";
import type { BusinessConfig, Reservation } from "@/lib/types";
import {
  formatDateTime,
  STATUS_CONFIG,
  CHANNEL_LABELS,
  calculateHourlyDistribution,
  calculateServicePopularity,
  calculateStaffPerformance,
  getWeeklyTrend,
  formatCurrency,
  exportReservationsCSV,
  exportClientsCSV,
  downloadCSV,
  getClients,
} from "@/lib/store";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
}

type Tab = "panoramica" | "servizi" | "orari" | "esporta";

export default function ReportsView({ config, reservations }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("panoramica");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "panoramica", label: "Panoramica", icon: "📊" },
    { id: "servizi", label: "Servizi", icon: "💆" },
    { id: "orari", label: "Orari", icon: "⏰" },
    { id: "esporta", label: "Esporta", icon: "📤" },
  ];

  const total = reservations.length;
  const completed = reservations.filter((r) => r.status === "completata");
  const cancelled = reservations.filter((r) => r.status === "cancellata");
  const noShows = reservations.filter((r) => r.status === "no_show");

  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const cancellationRate = total > 0 ? Math.round((cancelled.length / total) * 100) : 0;
  const noShowRate = total > 0 ? Math.round((noShows.length / total) * 100) : 0;

  const totalRevenue = completed.reduce((s, r) => s + (r.totalPrice || 0), 0);

  const avgPartySize =
    config.businessType === "ristorante"
      ? (() => {
          const nonCancelled = reservations.filter((r) => r.status !== "cancellata" && r.covers);
          if (nonCancelled.length === 0) return 0;
          const totalCovers = nonCancelled.reduce((s, r) => s + (r.covers || 0), 0);
          return Math.round((totalCovers / nonCancelled.length) * 10) / 10;
        })()
      : null;

  const clients = getClients();
  const clientIdsWithRes = new Set(reservations.filter((r) => r.clientId).map((r) => r.clientId));
  const newClients = [...clientIdsWithRes].filter((id) => {
    const c = clients.find((cl) => cl.id === id);
    return c && c.totalVisits <= 1;
  }).length;
  const returningClients = clientIdsWithRes.size - newClients;

  const weeklyTrend = getWeeklyTrend(reservations);
  const maxTrendRes = Math.max(...weeklyTrend.map((d) => d.reservations), 1);

  const channelCounts: Record<string, number> = {};
  reservations.forEach((r) => {
    channelCounts[r.channel] = (channelCounts[r.channel] || 0) + 1;
  });
  const topChannels = Object.entries(channelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const servicePopularity = calculateServicePopularity(
    reservations,
    config.services || []
  );

  const hourlyDist = calculateHourlyDistribution(reservations);
  const maxHourly = Math.max(...hourlyDist.map((h) => h.count), 1);
  const peakHourCount = Math.max(...hourlyDist.map((h) => h.count));

  const filteredExport = reservations.filter((r) => {
    if (!exportFrom && !exportTo) return true;
    const rDate = new Date(r.dateTime).toISOString().slice(0, 10);
    if (exportFrom && rDate < exportFrom) return false;
    if (exportTo && rDate > exportTo) return false;
    return true;
  });

  const handleExportReservations = () => {
    const csv = exportReservationsCSV(filteredExport);
    downloadCSV(csv, `prenotazioni_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportClients = () => {
    const csv = exportClientsCSV(clients);
    downloadCSV(csv, `clienti_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
          📈 Report e Analitiche
        </h2>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "panoramica" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                label: "Prenotazioni Totali",
                value: total,
                icon: "📋",
                color: "var(--primary)",
                bg: "var(--primary-muted)",
              },
              {
                label: "Tasso Completamento",
                value: `${completionRate}%`,
                icon: "✅",
                color: "var(--success)",
                bg: "var(--success-bg)",
              },
              {
                label: "Tasso Cancellazione",
                value: `${cancellationRate}%`,
                icon: "❌",
                color: "var(--error)",
                bg: "var(--error-bg)",
              },
              {
                label: "Tasso No-Show",
                value: `${noShowRate}%`,
                icon: "👻",
                color: "var(--warning)",
                bg: "var(--warning-bg)",
              },
              {
                label: "Ricavi Totali",
                value: formatCurrency(totalRevenue),
                icon: "💰",
                color: "#059669",
                bg: "rgba(5,150,105,0.1)",
              },
              ...(avgPartySize !== null
                ? [
                    {
                      label: "Media Coperti",
                      value: avgPartySize,
                      icon: "🍽️",
                      color: "var(--restaurant)",
                      bg: "var(--restaurant-bg)",
                    },
                  ]
                : []),
              {
                label: "Clienti Nuovi",
                value: newClients,
                icon: "🆕",
                color: "#3b82f6",
                bg: "rgba(59,130,246,0.1)",
              },
              {
                label: "Clienti Recorrenti",
                value: returningClients,
                icon: "🔄",
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.1)",
              },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
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

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
              📊 Andamento ultimi 7 giorni
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
              {weeklyTrend.map((day, i) => {
                const height = (day.reservations / maxTrendRes) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                      {day.reservations}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(height, 4)}%`,
                        minHeight: 4,
                        background: "var(--primary)",
                        borderRadius: 6,
                        transition: "height 0.3s",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {day.day}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
              🏆 Top 3 Canali
            </h3>
            {topChannels.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nessun dato disponibile</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topChannels.map(([channel, count], idx) => {
                  const conf = CHANNEL_LABELS[channel];
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div
                      key={channel}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: idx === 0 ? "#fef3c7" : idx === 1 ? "#f1f5f9" : "#fde8d8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: idx === 0 ? "#d97706" : idx === 1 ? "#64748b" : "#ea580c",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: 14 }}>{conf?.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>
                        {conf?.label || channel}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {count}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "servizi" && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
            💆 Popolarità Servizi
          </h3>
          {servicePopularity.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>
              Nessun servizio configurato o nessuna prenotazione
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid var(--border)",
                    }}
                  >
                    {["Servizio", "Categoria", "Prenotazioni", "Ricavi", "Tasso Cancell."].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          fontSize: 12,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.5px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {servicePopularity.map((s, i) => (
                    <tr
                      key={s.serviceName}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: i % 2 === 0 ? "transparent" : "var(--surface-2)",
                      }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)" }}>
                        {s.serviceName}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className="badge badge-neutral">{s.category}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)" }}>
                        {s.totalBookings}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#059669" }}>
                        {formatCurrency(s.totalRevenue)}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              s.cancellationRate > 30
                                ? "var(--error)"
                                : s.cancellationRate > 15
                                ? "var(--warning)"
                                : "var(--success)",
                          }}
                        >
                          {s.cancellationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "orari" && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
            ⏰ Distribuzione Oraria Prenotazioni
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {hourlyDist.map((h) => {
              const pct = (h.count / maxHourly) * 100;
              const isPeak = h.count === peakHourCount && h.count > 0;
              return (
                <div
                  key={h.hour}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isPeak ? "var(--primary)" : "var(--text-muted)",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {String(h.hour).padStart(2, "0")}:00
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 22,
                      borderRadius: 6,
                      background: "var(--surface-2)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(pct, h.count > 0 ? 2 : 0)}%`,
                        borderRadius: 6,
                        background: isPeak
                          ? "linear-gradient(90deg, var(--primary), #818cf8)"
                          : "var(--primary)",
                        opacity: isPeak ? 1 : 0.6,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 36,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isPeak ? "var(--primary)" : "var(--text)",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {h.count}
                  </span>
                  {isPeak && h.count > 0 && (
                    <span
                      className="badge"
                      style={{
                        fontSize: 10,
                        background: "var(--primary-muted)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: 99,
                        flexShrink: 0,
                      }}
                    >
                      Picco
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {peakHourCount === 0 && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                textAlign: "center",
                padding: 24,
              }}
            >
              Nessun dato disponibile per la distribuzione oraria
            </p>
          )}
        </div>
      )}

      {activeTab === "esporta" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
              📤 Esporta Dati
            </h3>

            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label">Da</label>
                <input
                  type="date"
                  className="form-input"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label">A</label>
                <input
                  type="date"
                  className="form-input"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--text)" }}>
                <strong>{filteredExport.length}</strong> prenotazioni nel periodo selezionato
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                <strong>{clients.length}</strong> clienti totali nel database
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={handleExportReservations}
                disabled={filteredExport.length === 0}
                style={{
                  opacity: filteredExport.length === 0 ? 0.5 : 1,
                  cursor: filteredExport.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Esporta Prenotazioni CSV
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleExportClients}
                disabled={clients.length === 0}
                style={{
                  opacity: clients.length === 0 ? 0.5 : 1,
                  cursor: clients.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Esporta Clienti CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
