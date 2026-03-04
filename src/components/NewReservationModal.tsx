"use client";

import { useState } from "react";
import type { BusinessConfig, Reservation, ReservationChannel } from "@/lib/types";
import { getReservations, saveReservations, generateId, formatDateTime } from "@/lib/store";

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
      channel: form.channel,
      status: "confermata",
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      aiHandled: false,
    };

    const all = getReservations();
    saveReservations([...all, reservation]);
    
    // Try to save to Google Sheets if configured
    const hasLocalStorage = typeof window !== "undefined" && !!(
      localStorage.getItem("gsheet_id") &&
      localStorage.getItem("gsheet_email") && 
      localStorage.getItem("gsheet_key")
    );
    
    if (hasLocalStorage) {
      const headers: Record<string, string> = {
        "x-gsheet-configured": "true",
        "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
        "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
        "x-gsheet-key": localStorage.getItem("gsheet_key") || "",
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
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            📅 Nuova Prenotazione
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: "6px 10px" }}>
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client info */}
          <div>
            <label className="form-label">Nome cliente *</label>
            <input
              className="form-input"
              placeholder="Es. Mario Rossi"
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Telefono</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+39 333 1234567"
                value={form.clientPhone}
                onChange={(e) => update("clientPhone", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="cliente@email.it"
                value={form.clientEmail}
                onChange={(e) => update("clientEmail", e.target.value)}
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="form-label">Servizio *</label>
            {services.length > 0 ? (
              <select
                className="form-input"
                value={form.service}
                onChange={(e) => {
                  const svc = services.find((s) => s.name === e.target.value);
                  update("service", e.target.value);
                  if (svc) update("duration", String(svc.duration));
                }}
              >
                <option value="">— Seleziona servizio —</option>
                {[...new Set(services.map((s) => s.category))].map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {services
                      .filter((s) => s.category === cat)
                      .map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.duration} min{s.price > 0 ? ` · €${s.price}` : ""})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <input
                className="form-input"
                placeholder="Es. Taglio capelli"
                value={form.service}
                onChange={(e) => update("service", e.target.value)}
              />
            )}
          </div>

          {/* Date/time + duration */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Data e ora *</label>
              <input
                className="form-input"
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => update("dateTime", e.target.value)}
                min={minDateTime}
              />
            </div>
            <div>
              <label className="form-label">Durata (min)</label>
              <input
                className="form-input"
                type="number"
                placeholder="60"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                min={5}
                max={480}
              />
            </div>
          </div>

          {/* Restaurant-specific */}
          {config.businessType === "ristorante" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="form-label">Numero coperti *</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="2"
                  value={form.covers}
                  onChange={(e) => update("covers", e.target.value)}
                  min={1}
                  max={config.maxCovers || 100}
                />
              </div>
              <div>
                <label className="form-label">Numero tavolo</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Es. 5"
                  value={form.tableNumber}
                  onChange={(e) => update("tableNumber", e.target.value)}
                  min={1}
                  max={config.tableCount || 50}
                />
              </div>
            </div>
          )}

          {/* Staff assignment (hair/beauty) */}
          {config.businessType !== "ristorante" && staff.length > 0 && (
            <div>
              <label className="form-label">Assegna a</label>
              <select
                className="form-input"
                value={form.staffId}
                onChange={(e) => update("staffId", e.target.value)}
              >
                <option value="">— Nessuna preferenza —</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Channel */}
          <div>
            <label className="form-label">Canale di prenotazione</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { id: "manuale", label: "✏️ Manuale" },
                { id: "telefono", label: "📞 Telefono" },
                { id: "email", label: "✉️ Email" },
                { id: "sms", label: "💬 SMS" },
                { id: "whatsapp", label: "📱 WhatsApp" },
                { id: "online", label: "🌐 Online" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => update("channel", ch.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 99,
                    fontSize: 13,
                    cursor: "pointer",
                    border: form.channel === ch.id ? "2px solid var(--primary)" : "2px solid var(--border)",
                    background: form.channel === ch.id ? "var(--primary-muted)" : "var(--surface)",
                    color: form.channel === ch.id ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: form.channel === ch.id ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Note (opzionale)</label>
            <textarea
              className="form-input"
              placeholder="Richieste speciali, preferenze, allergie..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="notification notification-error" style={{ fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Annulla
            </button>
            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Salva prenotazione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
