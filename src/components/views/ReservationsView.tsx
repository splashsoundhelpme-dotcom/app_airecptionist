"use client";

import { useState } from "react";
import type { BusinessConfig, Reservation, ReservationStatus } from "@/lib/types";
import {
  formatDateTime,
  STATUS_CONFIG,
  CHANNEL_LABELS,
  saveReservations,
  getReservations,
} from "@/lib/store";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
  onRefresh: () => void;
  onNewReservation: () => void;
}

type FilterStatus = "tutti" | ReservationStatus;
type FilterChannel = "tutti" | string;

export default function ReservationsView({ config, reservations, onRefresh, onNewReservation }: Props) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("tutti");
  const [filterChannel, setFilterChannel] = useState<FilterChannel>("tutti");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");

  const filtered = reservations
    .filter((r) => {
      if (filterStatus !== "tutti" && r.status !== filterStatus) return false;
      if (filterChannel !== "tutti" && r.channel !== filterChannel) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.clientName.toLowerCase().includes(q) ||
          r.service.toLowerCase().includes(q) ||
          (r.clientPhone || "").includes(q) ||
          (r.clientEmail || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      if (sortBy === "name") return a.clientName.localeCompare(b.clientName);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const selected = reservations.find((r) => r.id === selectedId);

  const updateStatus = (id: string, status: ReservationStatus) => {
    const all = getReservations();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    saveReservations(updated);
    onRefresh();
  };

  const deleteReservation = (id: string) => {
    const all = getReservations();
    saveReservations(all.filter((r) => r.id !== id));
    setSelectedId(null);
    onRefresh();
  };

  const channels = [...new Set(reservations.map((r) => r.channel))];

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 108px)" }}>
      {/* Left: list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Toolbar */}
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="form-input"
              placeholder="Cerca cliente, servizio, telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          {/* Status filter */}
          <select
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}
          >
            <option value="tutti">Tutti gli stati</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Channel filter */}
          <select
            className="form-input"
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}
          >
            <option value="tutti">Tutti i canali</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>{CHANNEL_LABELS[ch]?.label || ch}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "status")}
            style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}
          >
            <option value="date">Ordina per data</option>
            <option value="name">Ordina per nome</option>
            <option value="status">Ordina per stato</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={onNewReservation}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuova
          </button>
        </div>

        {/* Count */}
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          {filtered.length} prenotazion{filtered.length === 1 ? "e" : "i"}
          {search || filterStatus !== "tutti" || filterChannel !== "tutti" ? " (filtrate)" : ""}
        </p>

        {/* Table */}
        <div className="table-container" style={{ flex: 1, overflow: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servizio</th>
                <th>Data & Ora</th>
                <th>Canale</th>
                {config.businessType === "ristorante" && <th>Coperti</th>}
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.businessType === "ristorante" ? 7 : 6}
                    style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}
                  >
                    Nessuna prenotazione trovata
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const { date, time } = formatDateTime(r.dateTime);
                  const statusConf = STATUS_CONFIG[r.status];
                  const channelConf = CHANNEL_LABELS[r.channel];
                  const isSelected = selectedId === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(isSelected ? null : r.id)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--primary-muted)" : undefined,
                      }}
                    >
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{r.clientName}</p>
                          {r.clientPhone && (
                            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.clientPhone}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <p style={{ fontSize: 13 }}>{r.service}</p>
                        {r.aiHandled && (
                          <span style={{ fontSize: 11, color: "#667eea" }}>🤖 AI</span>
                        )}
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{date}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{time}</p>
                      </td>
                      <td>
                        <span style={{ fontSize: 13 }}>
                          {channelConf?.icon} {channelConf?.label || r.channel}
                        </span>
                      </td>
                      {config.businessType === "ristorante" && (
                        <td>
                          <span style={{ fontSize: 13 }}>
                            {r.covers ? `${r.covers} 🪑` : "—"}
                          </span>
                        </td>
                      )}
                      <td>
                        <span className={`badge ${statusConf.badgeClass}`}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: statusConf.dot,
                              display: "inline-block",
                            }}
                          />
                          {statusConf.label}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {r.status === "in_attesa" && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "var(--success-bg)",
                                color: "var(--success)",
                                border: "1px solid var(--success-border)",
                                padding: "4px 8px",
                                fontSize: 12,
                              }}
                              onClick={() => updateStatus(r.id, "confermata")}
                              title="Conferma"
                            >
                              ✓
                            </button>
                          )}
                          {(r.status === "confermata" || r.status === "in_attesa") && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "var(--error-bg)",
                                color: "var(--error)",
                                border: "1px solid var(--error-border)",
                                padding: "4px 8px",
                                fontSize: 12,
                              }}
                              onClick={() => updateStatus(r.id, "cancellata")}
                              title="Cancella"
                            >
                              ✕
                            </button>
                          )}
                          {r.status === "confermata" && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "var(--info-bg)",
                                color: "var(--info)",
                                border: "1px solid var(--info-border)",
                                padding: "4px 8px",
                                fontSize: 12,
                              }}
                              onClick={() => updateStatus(r.id, "completata")}
                              title="Completa"
                            >
                              ✓✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div
          className="card animate-slide-in"
          style={{
            width: 320,
            flexShrink: 0,
            padding: 20,
            height: "fit-content",
            position: "sticky",
            top: 0,
            maxHeight: "calc(100vh - 108px)",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Dettaglio</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedId(null)}
              style={{ padding: "4px 8px" }}
            >
              ✕
            </button>
          </div>

          {/* Client */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--primary-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--primary)",
                marginBottom: 10,
              }}
            >
              {selected.clientName.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{selected.clientName}</p>
            {selected.clientPhone && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                📞 {selected.clientPhone}
              </p>
            )}
            {selected.clientEmail && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                ✉️ {selected.clientEmail}
              </p>
            )}
          </div>

          <hr className="divider" style={{ marginBottom: 16 }} />

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Servizio", value: selected.service },
              {
                label: "Data & Ora",
                value: `${formatDateTime(selected.dateTime).date} alle ${formatDateTime(selected.dateTime).time}`,
              },
              {
                label: "Durata",
                value: selected.duration ? `${selected.duration} min` : "—",
              },
              {
                label: "Canale",
                value: `${CHANNEL_LABELS[selected.channel]?.icon} ${CHANNEL_LABELS[selected.channel]?.label || selected.channel}`,
              },
              ...(selected.covers
                ? [{ label: "Coperti", value: `${selected.covers} persone` }]
                : []),
              ...(selected.tableNumber
                ? [{ label: "Tavolo", value: `#${selected.tableNumber}` }]
                : []),
              ...(selected.staffId
                ? [{ label: "Staff", value: selected.staffId }]
                : []),
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 14, color: "var(--text)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {selected.notes && (
            <>
              <hr className="divider" style={{ margin: "14px 0" }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Note
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {selected.notes}
                </p>
              </div>
            </>
          )}

          {/* AI Transcript */}
          {selected.aiHandled && selected.aiTranscript && (
            <>
              <hr className="divider" style={{ margin: "14px 0" }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#667eea", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  🤖 Trascrizione AI
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    background: "rgba(102,126,234,0.06)",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(102,126,234,0.15)",
                  }}
                >
                  {selected.aiTranscript}
                </p>
              </div>
            </>
          )}

          {/* Status actions */}
          <hr className="divider" style={{ margin: "14px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cambia stato
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(["in_attesa", "confermata", "completata", "cancellata", "no_show"] as ReservationStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    className={`badge ${STATUS_CONFIG[s].badgeClass}`}
                    style={{
                      cursor: "pointer",
                      border: selected.status === s ? "2px solid currentColor" : undefined,
                      fontWeight: selected.status === s ? 700 : 500,
                    }}
                    onClick={() => updateStatus(selected.id, s)}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            className="btn btn-danger btn-sm"
            style={{ width: "100%", marginTop: 12 }}
            onClick={() => {
              if (confirm("Eliminare questa prenotazione?")) {
                deleteReservation(selected.id);
              }
            }}
          >
            🗑️ Elimina prenotazione
          </button>
        </div>
      )}
    </div>
  );
}
