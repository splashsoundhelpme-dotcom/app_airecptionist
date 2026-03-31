"use client";

import { useState } from "react";
import type { BusinessConfig, Reservation, ReservationChannel } from "@/lib/types";
import { getReservations, saveReservations, generateId, formatDateTime, DAYS_IT, getActiveTurniForDay, getAvailableTables } from "@/lib/store";

interface Props {
  config: BusinessConfig;
  onClose: () => void;
  onSaved: () => void;
}

// Function to send email notification
async function sendReservationEmail(reservation: Reservation, config: BusinessConfig) {
  if (!config.email) return;
  
  const { date, time } = formatDateTime(reservation.dateTime);
  
  const emailBody = `
    <h2>🔔 Nuova Prenotazione!</h2>
    <p><strong>Cliente:</strong> ${reservation.clientName}</p>
    <p><strong>Servizio:</strong> ${reservation.service}</p>
    <p><strong>Data:</strong> ${date} alle ${time}</p>
    ${reservation.clientPhone ? `<p><strong>Telefono:</strong> ${reservation.clientPhone}</p>` : ''}
    ${reservation.clientEmail ? `<p><strong>Email:</strong> ${reservation.clientEmail}</p>` : ''}
    ${reservation.covers ? `<p><strong>Coperti:</strong> ${reservation.covers}</p>` : ''}
    ${reservation.notes ? `<p><strong>Note:</strong> ${reservation.notes}</p>` : ''}
    <p><strong>Canale:</strong> ${reservation.channel}</p>
    <hr>
    <p style="color: #666; font-size: 12px;
  }">Inviato da AdminHub - Pannello di Gestione</p>
  `;

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: config.email,
        subject: `📅 Nuova Prenotazione: ${reservation.clientName} - ${reservation.service}`,
        body: emailBody,
        type: 'new_reservation'
      })
    });
    
    if (response.ok) {
      console.log('Email notification sent successfully');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

interface Props {
  config: BusinessConfig;
  onClose: () => void;
  onSaved: () => void;
}

export default function NewReservationModal({ config, onClose, onSaved }: Props) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    service: "",
    dateTime: "",
    duration: "",
    covers: "",
    tableNumber: "",
    tableIds: [] as string[],
    turnoId: "",
    channel: "manuale" as ReservationChannel,
    notes: "",
    staffId: "",
  });

  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) { setError("Inserisci il nome del cliente"); return; }
    if (!form.service.trim()) { setError("Seleziona o inserisci un servizio"); return; }
    if (!form.dateTime) { setError("Seleziona data e ora"); return; }
    if (config.businessType === "ristorante" && !form.covers) {
      setError("Inserisci il numero di coperti");
      return;
    }

    const reservation: Reservation = {
      id: generateId(),
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim() || undefined,
      clientEmail: form.clientEmail.trim() || undefined,
      service: form.service,
      serviceCategory: config.businessType,
      staffId: form.staffId || undefined,
      dateTime: new Date(form.dateTime).toISOString(),
      duration: form.duration ? parseInt(form.duration) : undefined,
      covers: form.covers ? parseInt(form.covers) : undefined,
      tableNumber: form.tableNumber ? parseInt(form.tableNumber) : undefined,
      tableIds: form.tableIds.length > 0 ? form.tableIds : undefined,
      turnoId: form.turnoId || undefined,
      channel: form.channel,
      status: "confermata",
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      aiHandled: false,
    };

    const all = getReservations();
    saveReservations([...all, reservation]);
    
    // Try to save to Google Sheets if configured
    const gsheetId = localStorage.getItem("gsheet_id");
    const gsheetEmail = localStorage.getItem("gsheet_email");
    const gsheetKey = localStorage.getItem("gsheet_key");
    const hasLocalStorage = typeof window !== "undefined" && !!(gsheetId && gsheetEmail && gsheetKey);
    
    console.log("Google Sheets config check:", { 
      hasLocalStorage, 
      gsheetId: gsheetId ? "SET" : "MISSING", 
      gsheetEmail: gsheetEmail ? "SET" : "MISSING", 
      gsheetKey: gsheetKey ? "SET (" + gsheetKey.length + " chars)" : "MISSING" 
    });
    
    if (hasLocalStorage) {
      console.log("Attempting to save to Google Sheets...");
      const storedKey = localStorage.getItem("gsheet_key") || "";
      let encodedKey = "";
      try {
        const cleanKey = storedKey.trim().replace(/\r\n/g, "\n");
        encodedKey = btoa(cleanKey);
      } catch (e) {
        console.error("Failed to encode key:", e);
      }
      
      const headers: Record<string, string> = {
        "x-gsheet-configured": "true",
        "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
        "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
        "x-gsheet-key": encodedKey,
      };
      
      // Format data for Google Sheets
      const sheetData = {
        id: reservation.id,
        cliente: reservation.clientName,
        telefono: reservation.clientPhone || "",
        email: reservation.clientEmail || "",
        servizio: reservation.service,
        data: formatDateTime(reservation.dateTime).date,
        ora: formatDateTime(reservation.dateTime).time,
        staff: reservation.staffId || "",
        stato: reservation.status,
        canale: reservation.channel,
        note: reservation.notes || "",
        creato: reservation.createdAt,
      };
      
      try {
        const response = await fetch("/api/sheets/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(sheetData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error("Google Sheets save failed:", result);
          setError("Errore Google Sheets: " + (result.error || result.message || "Errore sconosciuto"));
          return;
        }
        
        console.log("Google Sheets save success:", result);
      } catch (e) {
        console.error("Failed to save to Google Sheets:", e);
        setError("Errore di connessione: " + String(e));
        return;
      }
    } else {
      console.log("Google Sheets not configured - missing:", {
        id: !gsheetId,
        email: !gsheetEmail,
        key: !gsheetKey
      });
      // Google Sheets is optional - just log and continue
    }
    
    // Send email notification to business owner
    if (config.notifyEmail) {
      sendReservationEmail(reservation, config);
    }
    
    onSaved();
  };

  const services = config.services || [];
  const staff = config.staff || [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: 24,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            📅 Nuova Prenotazione
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="form-label">Nome cliente *</label>
              <input
                className="form-input"
                value={form.clientName}
                onChange={(e) => update("clientName", e.target.value)}
                placeholder="Inserisci il nome del cliente"
              />
            </div>
            <div>
              <label className="form-label">Telefono</label>
              <input
                className="form-input"
                value={form.clientPhone}
                onChange={(e) => update("clientPhone", e.target.value)}
                placeholder="Numero di telefono"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.clientEmail}
                onChange={(e) => update("clientEmail", e.target.value)}
                placeholder="email@esempio.com"
              />
            </div>
            {config.businessType === "ristorante" && (
              <div>
                <label className="form-label">Coperti *</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={form.covers}
                  onChange={(e) => update("covers", e.target.value)}
                  placeholder="Numero di coperti"
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="form-label">Servizio *</label>
            <select
              className="form-input"
              value={form.service}
              onChange={(e) => update("service", e.target.value)}
            >
              <option value="">Seleziona un servizio</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div>
              <label className="form-label">Data e Ora *</label>
              <input
                className="form-input"
                type="datetime-local"
                min={minDateTime}
                value={form.dateTime}
                onChange={(e) => update("dateTime", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Canale</label>
              <select
                className="form-input"
                value={form.channel}
                onChange={(e) => update("channel", e.target.value)}
              >
                <option value="email">📧 Email</option>
                <option value="telefono">📞 Telefono</option>
                <option value="sms">📱 SMS</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="online">🌐 Online</option>
                <option value="manuale">✍️ Manuale</option>
                <option value="ai">🤖 AI</option>
              </select>
            </div>
          </div>

          {/* Turno selector for restaurants */}
          {config.businessType === "ristorante" && config.turni && config.turni.length > 0 && form.dateTime && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Turno</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(() => {
                  const d = new Date(form.dateTime);
                  const dayIndex = d.getDay();
                  const dayName = DAYS_IT[dayIndex === 0 ? 6 : dayIndex - 1];
                  const activeTurni = getActiveTurniForDay(config.turni!, dayName);
                  if (activeTurni.length === 0) return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nessun turno attivo per questo giorno</p>;
                  return activeTurni.map((turno) => {
                    const allRes = getReservations();
                    const coversInTurno = allRes
                      .filter((r) => new Date(r.dateTime).toDateString() === d.toDateString() && r.turnoId === turno.id && r.status !== "cancellata")
                      .reduce((s, r) => s + (r.covers || 0), 0);
                    const available = turno.maxCovers - coversInTurno;
                    return (
                      <button
                        key={turno.id}
                        onClick={() => update("turnoId", turno.id)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: `2px solid ${form.turnoId === turno.id ? turno.color : "var(--border)"}`,
                          background: form.turnoId === turno.id ? `${turno.color}15` : "var(--surface)",
                          cursor: "pointer",
                          textAlign: "left",
                          minWidth: 140,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: turno.color }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{turno.name}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{turno.from} – {turno.to}</p>
                        <p style={{ fontSize: 11, color: available > 0 ? "var(--success)" : "var(--error)", marginTop: 2 }}>
                          {available > 0 ? `${available} coperti disponibili` : "Completo"}
                        </p>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Table selector for restaurants */}
          {config.businessType === "ristorante" && config.tables && config.tables.length > 0 && form.turnoId && form.dateTime && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Tavolo</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(() => {
                  const d = new Date(form.dateTime);
                  const covers = parseInt(form.covers) || 1;
                  const available = getAvailableTables(config.tables!, getReservations(), form.turnoId, d.toISOString(), covers);
                  const occupied = config.tables!.filter((t) => !available.find((a) => a.id === t.id) && t.isActive);
                  return (
                    <>
                      {available.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => {
                            const newIds = form.tableIds.includes(table.id)
                              ? form.tableIds.filter((id) => id !== table.id)
                              : [...form.tableIds, table.id];
                            setForm((prev) => ({ ...prev, tableIds: newIds, tableNumber: String(table.number) }));
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: `1.5px solid ${form.tableIds.includes(table.id) ? "var(--primary)" : "var(--border)"}`,
                            background: form.tableIds.includes(table.id) ? "var(--primary-muted)" : "var(--surface)",
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>#{table.number}</span>
                          <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>{table.seats} 👤</span>
                          {table.name && <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>({table.name})</span>}
                        </button>
                      ))}
                      {occupied.map((table) => (
                        <div
                          key={table.id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1.5px solid var(--border)",
                            background: "var(--surface)",
                            opacity: 0.4,
                            fontSize: 13,
                            cursor: "not-allowed",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>#{table.number}</span>
                          <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>Occupato</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {staff.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Staff</label>
              <select
                className="form-input"
                value={form.staffId}
                onChange={(e) => update("staffId", e.target.value)}
              >
                <option value="">Seleziona un membro dello staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label className="form-label">Note</label>
            <textarea
              className="form-input"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              placeholder="Note aggiuntive..."
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <button className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              💾 Salva Prenotazione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
