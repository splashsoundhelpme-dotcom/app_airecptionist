"use client";

import { useState } from "react";
import type { BusinessConfig, Reservation } from "@/lib/types";
import { STATUS_CONFIG, CHANNEL_LABELS } from "@/lib/store";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Sun, convert to Mon-based
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default function CalendarView({ config, reservations }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Group reservations by day
  const resByDay: Record<number, Reservation[]> = {};
  reservations.forEach((r) => {
    const d = new Date(r.dateTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!resByDay[day]) resByDay[day] = [];
      resByDay[day].push(r);
    }
  });

  const selectedDayRes = selectedDay
    ? (resByDay[selectedDay] || []).sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
    : [];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 108px)" }}>
      {/* Calendar */}
      <div className="card" style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            {MONTH_NAMES[month]} {year}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                padding: "4px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, flex: 1 }}>
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayRes = resByDay[day] || [];
            const isSelected = selectedDay === day;
            const today = isToday(day);
            const hasPending = dayRes.some((r) => r.status === "in_attesa");

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: isSelected
                    ? "2px solid var(--primary)"
                    : today
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                  background: isSelected
                    ? "var(--primary)"
                    : today
                    ? "var(--primary-muted)"
                    : dayRes.length > 0
                    ? "var(--surface-2)"
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s",
                  minHeight: 60,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: today || isSelected ? 700 : 400,
                    color: isSelected ? "white" : today ? "var(--primary)" : "var(--text)",
                  }}
                >
                  {day}
                </span>

                {/* Reservation dots */}
                {dayRes.length > 0 && (
                  <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {dayRes.slice(0, 3).map((r) => (
                      <span
                        key={r.id}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: isSelected
                            ? "rgba(255,255,255,0.8)"
                            : STATUS_CONFIG[r.status]?.dot || "var(--primary)",
                        }}
                      />
                    ))}
                    {dayRes.length > 3 && (
                      <span
                        style={{
                          fontSize: 9,
                          color: isSelected ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        +{dayRes.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {hasPending && !isSelected && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      display: "inline-block",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { color: "#22c55e", label: "Confermata" },
            { color: "#f59e0b", label: "In attesa" },
            { color: "#0ea5e9", label: "Completata" },
            { color: "#ef4444", label: "Cancellata" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.color,
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div className="card" style={{ width: 320, flexShrink: 0, padding: 20, overflowY: "auto" }}>
        {selectedDay ? (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              {selectedDay} {MONTH_NAMES[month]} {year}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              {selectedDayRes.length === 0
                ? "Nessuna prenotazione"
                : `${selectedDayRes.length} prenotazion${selectedDayRes.length === 1 ? "e" : "i"}`}
            </p>

            {selectedDayRes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
                <p style={{ fontSize: 14 }}>Giornata libera</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedDayRes.map((r) => {
                  const time = new Date(r.dateTime).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const statusConf = STATUS_CONFIG[r.status];
                  const channelConf = CHANNEL_LABELS[r.channel];
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        borderLeft: `3px solid ${statusConf.dot}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                          {time}
                        </span>
                        <span className={`badge ${statusConf.badgeClass}`} style={{ fontSize: 11 }}>
                          {statusConf.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                        {r.clientName}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                        {r.service}
                        {r.duration && ` · ${r.duration} min`}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {channelConf?.icon} {channelConf?.label}
                        </span>
                        {r.covers && (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            · {r.covers} 🪑
                          </span>
                        )}
                        {r.aiHandled && (
                          <span style={{ fontSize: 11, color: "#667eea" }}>· 🤖 AI</span>
                        )}
                      </div>
                      {r.notes && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                          {r.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Restaurant capacity */}
            {config.businessType === "ristorante" && selectedDayRes.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 10,
                  background: "var(--restaurant-bg)",
                  border: "1px solid rgba(234,88,12,0.15)",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--restaurant)", marginBottom: 6 }}>
                  🍽️ Coperti del giorno
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Prenotati</span>
                  <span style={{ fontWeight: 700, color: "var(--restaurant)" }}>
                    {selectedDayRes.reduce((sum, r) => sum + (r.covers || 0), 0)} / {config.maxCovers || "∞"}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    background: "rgba(234,88,12,0.15)",
                    marginTop: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        (selectedDayRes.reduce((sum, r) => sum + (r.covers || 0), 0) /
                          (config.maxCovers || 1)) *
                          100,
                        100
                      )}%`,
                      background: "var(--restaurant)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 14 }}>Seleziona un giorno per vedere le prenotazioni</p>
          </div>
        )}
      </div>
    </div>
  );
}
